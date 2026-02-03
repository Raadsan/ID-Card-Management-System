/*
  Warnings:

  - You are about to drop the column `backImage` on the `IdCardTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `frontImage` on the `IdCardTemplate` table. All the data in the column will be lost.
  - You are about to drop the `IDCard` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `IdCardTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `frontBackground` to the `IdCardTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `IDCard` DROP FOREIGN KEY `IDCard_employeeId_fkey`;

-- AlterTable
ALTER TABLE `IdCardTemplate` DROP COLUMN `backImage`,
    DROP COLUMN `frontImage`,
    ADD COLUMN `backBackground` VARCHAR(191) NULL,
    ADD COLUMN `frontBackground` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- DropTable
DROP TABLE `IDCard`;

-- CreateIndex
CREATE UNIQUE INDEX `IdCardTemplate_name_key` ON `IdCardTemplate`(`name`);
