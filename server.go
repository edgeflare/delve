package main

import (
	"bytes"
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	mw "github.com/edgeflare/pgo/middleware"
	"golang.org/x/net/webdav"
)

// embeddedFS holds the embedded Angular application files
//
//go:embed dist/delve-webui/browser
var embeddedFS embed.FS

func main() {
	// Parse command-line flags for configuration
	prefix := flag.String("prefix", "/webdav/", "WebDAV prefix")
	dir := flag.String("dir", ".", "WebDAV directory")
	allowedOrigins := flag.String("origins", "*", "Allowed origins (comma-separated)")
	allowedMethods := flag.String("methods", "GET,POST,PUT,DELETE,OPTIONS,PROPFIND,PROPPATCH,MKCOL,COPY,MOVE,LOCK,UNLOCK", "Allowed methods (comma-separated)")
	allowedHeaders := flag.String("headers", "Content-Type,Content-Length,Accept-Encoding,X-CSRF-Token,Authorization,accept,origin,Cache-Control,X-Requested-With,Depth,Destination,Overwrite,Timeout,If,Lock-Token,If-Match,If-None-Match,If-Modified-Since,If-Unmodified-Since,DAV,Brief,Prefer,Access-Control-Request-Method,Access-Control-Request-Headers", "Allowed headers (comma-separated)")
	allowCredentials := flag.Bool("credentials", true, "Allow credentials")
	port := flag.String("port", "8080", "Port to listen on")
	logger := flag.Bool("logger", false, "Enable request logging")
	basicAuth := flag.String("basic-auth", "", "Basic auth credentials in the format username:password (comma-separated for multiple users)")
	flag.Parse()

	// Validate command-line arguments
	if flag.NArg() > 0 {
		fmt.Println("Unexpected arguments provided")
		flag.Usage()
		os.Exit(1)
	}

	// Create WebDAV handler
	webdavHandler := &webdav.Handler{
		Prefix:     *prefix,
		FileSystem: webdav.Dir(*dir),
		LockSystem: webdav.NewMemLS(),
		Logger: func(r *http.Request, err error) {
			if err != nil {
				log.Printf("WebDAV error: %s", err)
			}
		},
	}

	// Configure CORS options for WebDAV
	webdavCorsOptions := &mw.CORSOptions{
		AllowedOrigins:   strings.Split(*allowedOrigins, ","),
		AllowedMethods:   strings.Split(*allowedMethods, ","),
		AllowedHeaders:   strings.Split(*allowedHeaders, ","),
		AllowCredentials: *allowCredentials,
	}

	// Initialize middleware chain
	var middlewares []func(http.Handler) http.Handler

	// Apply CORS middleware to WebDAV handler
	middlewares = append(middlewares, mw.CORSWithOptions(webdavCorsOptions))

	// Apply logger middleware if enabled
	if *logger {
		middlewares = append(middlewares, mw.LoggerWithOptions(nil))
	}

	// Apply Basic Auth middleware if credentials are provided
	if *basicAuth != "" {
		creds := mw.BasicAuthCreds(map[string]string{})
		for _, user := range strings.Split(*basicAuth, ",") {
			parts := strings.SplitN(user, ":", 2)
			if len(parts) != 2 {
				fmt.Println("Invalid basic-auth format. Expected format: username:password")
				flag.Usage()
				os.Exit(1)
			}
			creds.Credentials[parts[0]] = parts[1]
		}
		middlewares = append(middlewares, mw.VerifyBasicAuth(creds))
	}

	// Register and apply middlewares to WebDAV handler
	mw.Register(mw.RequestID)
	for _, middleware := range middlewares {
		mw.Register(middleware)
	}
	handler := mw.Apply(webdavHandler)

	// Create HTTP request multiplexer
	mux := http.NewServeMux()

	// Handle WebDAV requests
	mux.Handle(*prefix, handler)

	// Serve Angular app from embedded filesystem
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve index.html for the root path or non-file requests (handled by Angular routing)
		if r.URL.Path == "/" || !strings.Contains(r.URL.Path[1:], ".") {
			serveEmbeddedFile(w, r, "dist/delve-webui/browser/index.html")
			return
		}

		// Serve other files from the embedded filesystem
		filePath := filepath.Join("dist/delve-webui/browser", r.URL.Path)
		serveEmbeddedFile(w, r, filePath)
	})

	// Start the server
	log.Printf("Starting WebDAV server on :%s", *port)
	if err := http.ListenAndServe(":"+*port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// serveEmbeddedFile serves a file from the embedded file system with appropriate content type and handling for missing files
func serveEmbeddedFile(w http.ResponseWriter, r *http.Request, filePath string) {
	fileData, err := fs.ReadFile(embeddedFS, filePath)
	if err != nil {
		// Serve index.html for any error, including 404
		fileData, err = fs.ReadFile(embeddedFS, "dist/delve-webui/browser/index.html")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		filePath = "dist/delve-webui/browser/index.html" // Update filePath for content-type
	}

	// Get file info to access modification time
	fileInfo, err := fs.Stat(embeddedFS, filePath)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Set Content-Type header based on file extension
	ext := filepath.Ext(filePath)
	switch ext {
	case ".js":
		w.Header().Set("Content-Type", "application/javascript")
	case ".css":
		w.Header().Set("Content-Type", "text/css")
	case ".html":
		w.Header().Set("Content-Type", "text/html")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".svg":
		w.Header().Set("Content-Type", "image/svg+xml")
	case ".json":
		w.Header().Set("Content-Type", "application/json")
	default:
		w.Header().Set("Content-Type", "application/octet-stream")
	}

	http.ServeContent(w, r, filePath, fileInfo.ModTime(), bytes.NewReader(fileData))
}
