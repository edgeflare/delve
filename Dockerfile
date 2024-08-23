# Build UI
FROM docker.io/node:22.2.0-alpine3.20 as UI-BUILDER
WORKDIR /ui
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npx ng build ng-essential && npx ng build

# Build go
FROM docker.io/golang:1.23.0-alpine3.20 as BUILDER
RUN apk add --no-cache git
WORKDIR /workspace
COPY . .
RUN rm -rf /workspace/dist/delve-webui/browser
COPY --from=UI-BUILDER /ui/dist/delve-webui/browser /workspace/dist/delve-webui/browser
RUN go mod tidy
ARG CGO_ENABLED=0
ARG GOOS=linux
ARG GOARCH=amd64
RUN CGO_ENABLED=${CGO_ENABLED} GOOS=${GOOS} GOARCH=${GOARCH} \
  go build -ldflags='-w -s -extldflags "-static"' -a -o delve .

# Copy binary into final (alpine) image
FROM docker.io/alpine:3.20
RUN adduser -D -h /workspace 1000
USER 1000
WORKDIR /workspace
COPY --from=BUILDER /workspace/delve .
EXPOSE 8080
ENTRYPOINT ["/workspace/delve"]
