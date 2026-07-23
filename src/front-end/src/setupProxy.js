const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/auth", "/users", "/demandes", "/logements", "/reservations", "/payments", "/abonnements", "/reversements", "/webhooks", "/messages", "/admin"],
    createProxyMiddleware({
      target: "http://localhost:8089",
      changeOrigin: true,
    })
  );
};
