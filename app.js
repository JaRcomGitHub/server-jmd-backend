const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const { appOnline } = require("./src/app-online");

mongoose.set("strictQuery", false);

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

async function server() {
  try {
    appOnline();
    await mongoose.connect(MONGODB_URI);
    console.log("Database connection successful");
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
