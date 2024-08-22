import { HttpClient, HttpHeaders } from '@angular/common/http';
import { effect, Inject, Injectable, Optional, signal } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { WEBDAV_BASE_URL } from './webdav-url.token';
import { WebdavResource } from '../types';

/**
 * Extracts the text content of a specific tag within an XML element.
 * @param element The XML element to search within.
 * @param tagName The name of the tag whose text content to extract.
 * @returns The text content of the tag, or undefined if the tag is not found.
 */
function extractTextContent(element: Element, tagName: string): string | undefined {
  const elements = element.getElementsByTagNameNS("DAV:", tagName);
  return elements.length > 0 ? elements[0].textContent || '' : undefined;
}

/**
 * Parses the XML response from a WebDAV PROPFIND request into an array of `Resource` objects.
 * @param xmlString The XML string to parse.
 * @returns An array of `Resource` objects representing the WebDAV resources.
 */
export function parsePropfind(xmlString: string): WebdavResource[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const responseElements = xmlDoc.getElementsByTagNameNS("DAV:", "response");

  return Array.from(responseElements).map(responseElement => {
    return {
      href: extractTextContent(responseElement, "href") || "",
      modified: extractTextContent(responseElement, "getlastmodified") || "",
      contentType: extractTextContent(responseElement, "getcontenttype"),
      size: parseInt(extractTextContent(responseElement, "getcontentlength") || "0", 10),
      name: extractTextContent(responseElement, "displayname"),
      etag: extractTextContent(responseElement, "getetag")
    };
  });
}

@Injectable({
  providedIn: 'root'
})
export class WebdavService {
  /** The base URL of the WebDAV server. */
  private baseUrl = ' http://localhost:8080/webdav';

  /** The default headers for WebDAV requests. */
  headers = new HttpHeaders({
    'Depth': '1',
    'Content-Type': 'application/xml'
  });

  /** A signal holding the list of WebDAV resources. */
  resources = signal<WebdavResource[]>([]);

  /**
   * Creates an instance of the WebdavService.
   * @param http The Angular HttpClient for making HTTP requests.
   * @param baseUrl (Optional) The base URL of the WebDAV server. If not provided, defaults to '/webdav'.
   */
  constructor(private http: HttpClient, @Optional() @Inject(WEBDAV_BASE_URL) baseUrl?: string) {
    this.baseUrl = baseUrl || this.baseUrl;

    effect(() => {
      this.propfind();
    });
  }

  /**
   * Performs a PROPFIND request to fetch the list of WebDAV resources.
   */
  propfind() {
    this.http.request('PROPFIND', `${this.baseUrl}/`, {
      headers: this.headers,
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.resources.set(parsePropfind(response));
      },
      error: (error) => {
        console.error('Error fetching WebDAV resources:', error);
        throw error;
      }
    });
  }

  /**
   * Creates or updates a file on the WebDAV server using a PUT request
   * @param filePath The path of the file to create or update, relative to the baseUrl
   * @param content The content of the file, either as a Blob (for file uploads) or a string
   * @returns An observable that emits the response from the PUT request
   */
  put(filePath: string, content: Blob | string) {
    const headers = new HttpHeaders({
      'Content-Type': content instanceof Blob ? content.type : 'text/plain'
    });

    return this.http.put(`${this.baseUrl}/${filePath}`, content, { headers, responseType: 'text' }).pipe(
      tap(() => {
        /** Refresh the resource list after a successful PUT */
        this.propfind();
      }),
      catchError(error => {
        console.error('Error creating/updating WebDAV file:', error);
        throw error;
      })
    );
  }

  /** Retrieves the content of the specified file from the WebDAV server
   * @param filePath The path of the file to fetch, relative to the baseUrl
   * @returns An observable that emits the content of the file as a string
   */
  get(filePath: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/${filePath}`, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Error fetching file:', error);
        // Handle the error appropriately (e.g., show an error message to the user)
        throw error;
      })
    );
  }

}
