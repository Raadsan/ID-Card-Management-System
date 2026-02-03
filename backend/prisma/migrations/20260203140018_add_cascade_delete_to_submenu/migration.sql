/*
  Warnings:

  - You are about to drop the column `employeeCode` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `SubMenu` DROP FOREIGN KEY `SubMenu_menuId_fkey`;

-- DropIndex
DROP INDEX `Employee_employeeCode_key` ON `Employee`;

-- AlterTable
ALTER TABLE `Employee` DROP COLUMN `employeeCode`;

-- AddForeignKey
ALTER TABLE `SubMenu` ADD CONSTRAINT `SubMenu_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
