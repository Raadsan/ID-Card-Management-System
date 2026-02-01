export interface SubMenu {
    _id?: string;
    title: string;
    url: string;
}

export interface Menu {
    _id: string;
    title: string;
    icon?: string;
    url?: string;
    isCollapsible: boolean;
    subMenus?: SubMenu[];
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuResponse {
    success: boolean;
    message?: string;
    data?: Menu | Menu[];
}
