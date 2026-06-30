import { z } from "zod";

// ─── Project Status ──────────────────────────────────────────────

export const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type ProjectStatusType = (typeof PROJECT_STATUSES)[number];

/**
 * Valid lifecycle transitions.
 * PLANNING  → ACTIVE
 * ACTIVE    → ON_HOLD | COMPLETED
 * ON_HOLD   → ACTIVE
 * COMPLETED → ARCHIVED
 * ARCHIVED  → (none — read-only)
 */
export const VALID_STATUS_TRANSITIONS: Record<ProjectStatusType, ProjectStatusType[]> = {
  PLANNING:  ["ACTIVE"],
  ACTIVE:    ["ON_HOLD", "COMPLETED"],
  ON_HOLD:   ["ACTIVE"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED:  [],
};

export const STATUS_LABELS: Record<ProjectStatusType, string> = {
  PLANNING:  "Planning",
  ACTIVE:    "Active",
  ON_HOLD:   "On Hold",
  COMPLETED: "Completed",
  ARCHIVED:  "Archived",
};

export const updateProjectStatusSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  status: z.enum(PROJECT_STATUSES, {
    error: "Invalid project status",
  }),
});

export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;

// ─── Project Timeline ────────────────────────────────────────────

export const updateProjectTimelineSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export type UpdateProjectTimelineInput = z.infer<typeof updateProjectTimelineSchema>;

// ─── Project Resource Upload ─────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "application/zip",
] as const;

export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES };

export const uploadResourceSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or less"),
  fileSize: z
    .number()
    .min(1, "File cannot be empty")
    .max(MAX_FILE_SIZE, "File size must be 10 MB or less"),
  mimeType: z.string().refine(
    (val) => (ALLOWED_MIME_TYPES as readonly string[]).includes(val),
    "Unsupported file type. Allowed: PDF, DOCX, PNG, JPG, GIF, WEBP, ZIP"
  ),
});

export type UploadResourceInput = z.infer<typeof uploadResourceSchema>;
