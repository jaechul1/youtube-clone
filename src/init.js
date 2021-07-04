import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 4000;

const handleListen = () =>
  console.log(`✔ Server listening on http://localhost:${PORT}`);

app.listen(PORT, handleListen);
