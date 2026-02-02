-- AlterTable
ALTER TABLE `DepartmentTransfer` ADD COLUMN `authorizedById` INTEGER NULL,
    ADD COLUMN `reason` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DepartmentTransfer` ADD CONSTRAINT `DepartmentTransfer_authorizedById_fkey` FOREIGN KEY (`authorizedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
