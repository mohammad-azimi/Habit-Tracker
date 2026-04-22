/*
  Warnings:

  - A unique constraint covering the columns `[userId,monthKey]` on the table `DashboardMonth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `DashboardMonth` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DashboardMonth_monthKey_key";

-- AlterTable
ALTER TABLE "DashboardMonth" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DashboardMonth_userId_monthKey_key" ON "DashboardMonth"("userId", "monthKey");
