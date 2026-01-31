-- CreateTable
CREATE TABLE `DepartmentTransfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `fromDepartmentId` INTEGER NOT NULL,
    `toDepartmentId` INTEGER NOT NULL,
    `transferDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DepartmentTransfer` ADD CONSTRAINT `DepartmentTransfer_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepartmentTransfer` ADD CONSTRAINT `DepartmentTransfer_fromDepartmentId_fkey` FOREIGN KEY (`fromDepartmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepartmentTransfer` ADD CONSTRAINT `DepartmentTransfer_toDepartmentId_fkey` FOREIGN KEY (`toDepartmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
