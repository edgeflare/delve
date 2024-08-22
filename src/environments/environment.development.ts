export const environment = {
  api: "http://localhost:8080/api/v1",
  oidcConfig: {
    authority: "https://iam-b45a263d486c.asia-southeast1.edgeflare.dev",
    client_id: "277428190274717690",
    redirect_uri: "http://localhost:4200/signin/callback",
    response_type: "code",
    scope: "openid profile email",
    post_logout_redirect_uri: "http://localhost:4200/signout/callback",
    automaticSilentRenew: true,
    silentRequestTimeoutInSeconds: 30,
    silent_redirect_uri: "http://localhost:4200/silent-refresh-callback.html",
  },
  mqtt: {
    hostname: "mqtt-b45a263d486c.asia-southeast1.edgeflare.dev",
    port: 443,
    path: "/mqtt",
    protocol: "wss",
    username: "public",
    password: "public",
  },
  cloudflare: {
    accountHash: "JANQz1aoc0j0z4-hBEPBbg",
  },
};
