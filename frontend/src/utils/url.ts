import { UPLOAD_URL } from "@/api/axios";

export const getImageUrl = (path: string | undefined | null) => {
    if (!path || path === "" || path === "undefined" || path === "null") return null;
    if (path.startsWith("http")) return path;

    // Normalize backslashes to forward slashes for Windows paths 
    let cleanPath = path.replace(/\\/g, "/");

    // Ensure path doesn't start with / if we're adding it
    cleanPath = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath;

    // Check if path already contains 'uploads/'
    if (cleanPath.startsWith("uploads/")) {
        const rootUrl = UPLOAD_URL.replace("/uploads", "");
        return `${rootUrl}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    }

    // Default case: assume it's in the uploads folder
    return `${UPLOAD_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
};

export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};
