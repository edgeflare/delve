import { InjectionToken } from "@angular/core";

/** Injection token for providing a custom base URL for the WebDAV service. */
export const WEBDAV_BASE_URL = new InjectionToken<string>('WebDAV Base URL');
