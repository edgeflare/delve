/**
 * Represents the possible window modes for the RevealComponent.
 */
export type WindowMode = 'edit' | 'preview' | 'vsplit' | 'hsplit';

/**
 * Represents a WebDAV resource.
 */
export interface WebdavResource {
    /** The URL or path of the resource. */
    href: string;
    /** The last modified date of the resource. */
    modified: Date | string;
    /** The content type of the resource (optional for directories). */
    contentType?: string;
    /** The size of the resource in bytes (optional for directories). */
    size?: number;
    /** The display name of the resource. */
    name?: string;
    /** The entity tag (ETag) of the resource, used for caching and concurrency control. */
    etag?: string;
}

export interface ConfirmDeleteDialogData {
    itemName: string;
    deleteUrl: string;
    itemType?: string;
}