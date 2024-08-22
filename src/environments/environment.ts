export const environment = {
  api: "https://api-b45a263d486c.asia-southeast1.edgeflare.dev",
  oidcConfig: {
    authority: "https://iam-b45a263d486c.asia-southeast1.edgeflare.dev",
    client_id: "277428190274717690",
    redirect_uri: "https://vpn.edgeflare.io/signin/callback",
    response_type: "code",
    scope: "openid profile email",
    post_logout_redirect_uri: "https://vpn.edgeflare.io/signout/callback",
    automaticSilentRenew: true,
    silentRequestTimeoutInSeconds: 30,
    silent_redirect_uri: "https://vpn.edgeflare.io/silent-refresh-callback.html",
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
