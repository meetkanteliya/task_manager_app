import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "@/lib/validations/project";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify project exists and user is a member
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { userId: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "This project is archived and read-only" },
        { status: 403 }
      );
    }

    const isMember = project.members.some((m) => m.userId === session.user.id);
    const isOwner = project.ownerId === session.user.id;
    if (!isMember && !isOwner) {
      return NextResponse.json(
        { error: "You do not have access to this project" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be 10 MB or less" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: PDF, DOCX, PNG, JPG, GIF, WEBP, ZIP" },
        { status: 400 }
      );
    }

    // Check for duplicate filename in this project
    const existing = await db.projectResource.findUnique({
      where: { projectId_filename: { projectId, filename: file.name } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A file named "${file.name}" already exists in this project` },
        { status: 409 }
      );
    }

    // Save file to local filesystem
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Store URL path (relative to public dir)
    const fileUrl = `/uploads/projects/${projectId}/${encodeURIComponent(file.name)}`;

    // Create database record
    const resource = await db.projectResource.create({
      data: {
        filename: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        projectId,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Log project activity
    await db.projectActivity.create({
      data: {
        type: "RESOURCE_UPLOADED",
        message: `${session.user.name || session.user.email} uploaded "${file.name}"`,
        projectId,
        userId: session.user.id,
      },
    });

    revalidatePath(`/projects/${projectId}`);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
