-- CreateTable
CREATE TABLE `RolePermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RolePermissions_roleId_key`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleMenuAccess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rolePermissionsId` INTEGER NOT NULL,
    `menuId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoleMenuAccess_rolePermissionsId_menuId_key`(`rolePermissionsId`, `menuId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleSubMenuAccess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleMenuAccessId` INTEGER NOT NULL,
    `subMenuId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoleSubMenuAccess_roleMenuAccessId_subMenuId_key`(`roleMenuAccessId`, `subMenuId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleMenuAccess` ADD CONSTRAINT `RoleMenuAccess_rolePermissionsId_fkey` FOREIGN KEY (`rolePermissionsId`) REFERENCES `RolePermissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleMenuAccess` ADD CONSTRAINT `RoleMenuAccess_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleSubMenuAccess` ADD CONSTRAINT `RoleSubMenuAccess_roleMenuAccessId_fkey` FOREIGN KEY (`roleMenuAccessId`) REFERENCES `RoleMenuAccess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleSubMenuAccess` ADD CONSTRAINT `RoleSubMenuAccess_subMenuId_fkey` FOREIGN KEY (`subMenuId`) REFERENCES `SubMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
