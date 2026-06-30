"use client";

import { useState, useTransition } from "react";
import { Upload, Trash2, File, ExternalLink, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { deleteProjectResource } from "@/lib/actions/projects";
import { toast } from "sonner";

type Resource = {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date | string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Props = {
  projectId: string;
  resources: Resource[];
  isArchived: boolean;
  canDelete: boolean;
  onRefresh: () => void;
};

export default function ProjectResources({
  projectId,
  resources,
  isArchived,
  canDelete,
  onRefresh,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith("image/");
  };

  const isPdf = (mimeType: string) => {
    return mimeType === "application/pdf";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Client-side size validation (10 MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be 10 MB or less");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isArchived) return;

    // Check duplicate filename client-side
    const duplicate = resources.some(
      (r) => r.filename.toLowerCase() === file.name.toLowerCase()
    );
    if (duplicate) {
      toast.error(`A file named "${file.name}" already exists in this project`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/resources/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      toast.success("File uploaded successfully");
      setFile(null);
      
      // Reset input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (resourceId: string, filename: string) => {
    if (isArchived) return;
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setDeletingId(resourceId);
    startTransition(async () => {
      try {
        await deleteProjectResource(resourceId);
        toast.success("File deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete file");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      {!isArchived && (
        <form onSubmit={handleUpload} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label htmlFor="file-upload" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Upload File (PDF, DOCX, PNG, JPG, GIF, WEBP, ZIP &middot; Max 10MB)
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,.zip"
                disabled={isUploading || isPending}
                className="w-full text-xs font-medium text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#2563EB] hover:file:bg-blue-100 dark:file:bg-blue-950/40 dark:file:text-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={!file || isUploading || isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 sm:self-end"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload Resource
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <File className="mx-auto text-slate-400" size={32} />
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-200">
            No resources uploaded
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Store project documents, PDF files, and design images in one place.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* File info and preview */}
                <div className="flex items-start gap-3 min-w-0">
                  {isImage(resource.mimeType) ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center">
                      {/* Thumbnail preview */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resource.fileUrl}
                        alt={resource.filename}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] dark:bg-blue-950/30 dark:text-blue-400">
                      <File size={22} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={resource.filename}>
                      {resource.filename}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(resource.fileSize)}</span>
                      <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                      <span>Uploaded by {resource.uploadedBy.name || resource.uploadedBy.email}</span>
                      <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                      <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isPdf(resource.mimeType) && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      title="Open in new tab"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  
                  <a
                    href={resource.fileUrl}
                    download={resource.filename}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    title="Download file"
                  >
                    <Download size={15} />
                  </a>

                  {canDelete && !isArchived && (
                    <button
                      type="button"
                      onClick={() => handleDelete(resource.id, resource.filename)}
                      disabled={deletingId === resource.id}
                      className="inline-flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                      title="Delete resource"
                    >
                      {deletingId === resource.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
