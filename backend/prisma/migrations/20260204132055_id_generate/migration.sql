-- AlterTable
ALTER TABLE `IdCardTemplate` ADD COLUMN `layout` JSON NULL;

-- CreateTable
CREATE TABLE `id_generate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `templateId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `printedById` INTEGER NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `status` ENUM('created', 'ready_to_print', 'printed') NOT NULL DEFAULT 'created',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `id_generate_qrCode_key`(`qrCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `id_generate` ADD CONSTRAINT `id_generate_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_generate` ADD CONSTRAINT `id_generate_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `IdCardTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_generate` ADD CONSTRAINT `id_generate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_generate` ADD CONSTRAINT `id_generate_printedById_fkey` FOREIGN KEY (`printedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
