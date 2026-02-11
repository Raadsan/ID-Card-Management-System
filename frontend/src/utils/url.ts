import { BASE_URL } from "@/api/axios";

export const API_BASE_URL = BASE_URL.replace("/api", "");

export const getImageUrl = (path: string | undefined | null) => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;

    // Normalize backslashes to forward slashes for Windows paths
    let cleanPath = path.replace(/\\/g, "/");

    // Ensure path doesn't start with / if we're adding it
    cleanPath = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath;

    // Auto-prepend uploads/ if likely missing (simple heuristic)
    if (!cleanPath.startsWith("uploads/") && !cleanPath.startsWith("images/")) {
        cleanPath = `uploads/${cleanPath}`;
    }

    // Also handle 'uploads/' prefix if needed, but usually the backend returns it
    return `${API_BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
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
