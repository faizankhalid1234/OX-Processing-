const express = require("express");
const cors = require("cors");
const { config } = require("./lib/config");
const { initDb } = require("./lib/db");
const { registerApiRoutes } = require("./routes/api");
const { registerWebhookRoutes } = require("./routes/webhook");

const app = express();

app.use(cors());
app.use(
  ["/webhooks/cryptoprocessing", "/webhooks/0xprocessing"],
  express.raw({ type: "*/*", limit: "2mb" })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.static(config.frontendDir));

registerApiRoutes(app);
registerWebhookRoutes(app);

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});

initDb()
  .then(() => {
    app.listen(config.port, () => {
      const receiveUrl = `${config.publicAppUrl}/webhooks/0xprocessing`;
      console.log(`Checkout running at ${config.publicAppUrl}`);
      console.log(`Webhook RECEIVE (set this in 0xProcessing portal): ${receiveUrl}`);
      console.log(`Webhook FORWARD (viewer): ${config.callbackUrl}`);
      console.log("PostgreSQL ready");
    });
  })
  .catch((error) => {
    console.error(
      "PostgreSQL connection failed:",
      (error && error.message) || error
    );
    process.exit(1);
  });
