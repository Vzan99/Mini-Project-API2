-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reset_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_token" TEXT;
