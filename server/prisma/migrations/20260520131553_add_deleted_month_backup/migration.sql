-- CreateTable
CREATE TABLE "DeletedMonthBackup" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "monthKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "originalCreatedAt" TIMESTAMP(3),
    "originalUpdatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeletedMonthBackup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeletedMonthBackup_userId_monthKey_key" ON "DeletedMonthBackup"("userId", "monthKey");
