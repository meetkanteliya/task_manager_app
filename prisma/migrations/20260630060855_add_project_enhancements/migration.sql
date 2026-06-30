-- CreateEnum
CREATE TYPE "taskflow"."ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "taskflow"."ProjectActivityType" AS ENUM ('PROJECT_CREATED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'LEADER_ASSIGNED', 'LEADER_REMOVED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'SUBTASK_COMPLETED', 'STATUS_CHANGED', 'TIMELINE_UPDATED', 'RESOURCE_UPLOADED', 'RESOURCE_DELETED', 'PROJECT_ARCHIVED');

-- AlterTable
ALTER TABLE "taskflow"."Project" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "taskflow"."ProjectStatus" NOT NULL DEFAULT 'PLANNING';

-- CreateTable
CREATE TABLE "taskflow"."ProjectActivity" (
    "id" TEXT NOT NULL,
    "type" "taskflow"."ProjectActivityType" NOT NULL,
    "message" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskflow"."ProjectResource" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectActivity_projectId_idx" ON "taskflow"."ProjectActivity"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectResource_projectId_filename_key" ON "taskflow"."ProjectResource"("projectId", "filename");

-- AddForeignKey
ALTER TABLE "taskflow"."ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "taskflow"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskflow"."ProjectActivity" ADD CONSTRAINT "ProjectActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "taskflow"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskflow"."ProjectResource" ADD CONSTRAINT "ProjectResource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "taskflow"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskflow"."ProjectResource" ADD CONSTRAINT "ProjectResource_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "taskflow"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
