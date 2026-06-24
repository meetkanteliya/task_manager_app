-- CreateEnum
CREATE TYPE "taskflow"."Role" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "taskflow"."User" ADD COLUMN "role" "taskflow"."Role" NOT NULL DEFAULT 'MEMBER';