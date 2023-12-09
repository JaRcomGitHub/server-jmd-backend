const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const { WS_URL_PORT } = process.env;
const { wsClientListen } = require("./src/ws-client");

mongoose.set("strictQuery", false);

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

async function server() {
  const date = new Date();
  try {
    wsClientListen(WS_URL_PORT);
    await mongoose.connect(MONGODB_URI);
    console.log("Database connection successful ", date);
    app.listen(PORT, (err) => {
      if (err) console.error("Error start server:", err);
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Error connect to MONGODB", error.message);
    process.exit(1);
  }
}

server();
