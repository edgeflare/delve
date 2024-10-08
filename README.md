# `delve`: for developers to create/share slides, charts in plain text

If you're reading this, you probably hate the likes of MS Office, and are familiar with:

- [reveal.js](https://revealjs.com/) for slides with markdown,mermaid etc supported by reveal itself
- [echarts](https://echarts.apache.org) using [ngx-echarts](https://xieziyu.github.io/ngx-echarts/) for charts
- [ace](https://github.com/ajaxorg/ace) for code editor

delve integrates the above tools, and a simple WebDAV server for remote access/editing, in a zero-dependency Go binary that embeds a WebUI written in [Angular](https://angular.io). It runs on Linux, Windows, macOS, and as container. editor isn't really robust (ace itself is great but we're not leveraging its capabilities); can be used for typo fixes etc.

## let's `delve` in...

```shell
git clone https://github.com/edgeflare/delve.git && cd delve
make build-darwin-arm64 # or make build-linux-amd64, make build-windows-amd64, etc. see Makefile
./bin/delve # ./bin/delve --help for available options
```

or as container

```shell
make image # or make image CONTAINER_RUNTIME=podman, to use podman runtime
docker run -p 8080:8080 -v $PWD:/webdav edgeflare/delve --dir=/webdav # or podman run ...
```

|                                                          |                                                   |
|----------------------------------------------------------|---------------------------------------------------|
| ![webdav-resources](./public/img/webdav-resources.png)   | ![postgres-arch](./public/img/postgres-arch-mermaid.png)  |
| ![ace-reveal-vsplit](./public/img/ace-reveal-vsplit.png) | ![echarts-tree](./public/img/echarts-tree.png)    |

## WebDAV Server

This is a simple Go WebDAV server implementation using the `golang.org/x/net/webdav` package. The `edgeflare/pgo/middleware` package is used to provide middleware for request ID, CORS, and logging.

* Serves files from the `.` directory. supply the `--dir` flag to specify a different directory.
* Supports basic WebDAV operations (see below).
* Includes middleware for request ID generation, CORS handling, and logging.

### Common WebDAV Methods (not all implemented in UI, yet)

| Method | Description | Example |
|---|---|---|
| `PROPFIND` | Retrieves properties of a resource or collection. | `curl -X PROPFIND -H "Depth: 1" http://localhost:8080/webdav/` |
| `GET` | Retrieves the content of a file. | `curl http://localhost:8080/webdav/filename.txt` |
| `PUT` | Uploads or modifies a file. | `echo 'helloworld' > newfile.txt && curl -T newfile.txt http://localhost:8080/webdav/newfile.txt` |
| `MKCOL` | Creates a new collection (directory). | `curl -X MKCOL http://localhost:8080/webdav/newdirectory/` |
| `DELETE` | Deletes a file or collection. | `curl -X DELETE http://localhost:8080/webdav/file-to-delete.txt` |
| `MOVE` | Moves or renames a file or collection. | `curl -X MOVE -H "Destination: http://localhost:8080/webdav/newname.txt" http://localhost:8080/webdav/oldname.txt` |
| `COPY` | Copies a file or collection. | `curl -X COPY -H "Destination: http://localhost:8080/webdav/copy-of-file.txt" http://localhost:8080/webdav/original-file.txt` |
| `LOCK` | Obtains a lock on a resource. | `curl -X LOCK -H "Timeout: Infinite" http://localhost:8080/webdav/file-to-lock.txt` |
| `UNLOCK` | Releases a lock on a resource. | `curl -X UNLOCK -H "Lock-Token: <lock-token>" http://localhost:8080/webdav/file-to-unlock.txt` |

**Note:** Replace placeholders like `<lock-token>` with actual values.

## Development/Contributing
Feel free to chip-in, if you have any ideas, suggestions, or issues, please open an issue or PR.

```shell
git clone https://github.com/edgeflare/delve.git && cd delve
npm install && npx ng build ng-essential
npx ng build --watch ## to serve with go. or ng serve
go mod tidy
go run .
```
