import { YoutubeService } from "./services/youtubeService.js";
import express from "express";

const app = express();

app.get("/stream/:id", (req, res) => {
  YoutubeService.streamAudioToResponse(req.params.id, req, res).catch(err => {
    console.error("Unhandled top level err:", err);
    res.status(500).json({ error: "crash" });
  });
});

const server = app.listen(3000, async () => {
  console.log("Server listening");
  try {
    const res = await fetch("http://localhost:3000/stream/Nt9L1jCKGnE");
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Test failed", err);
  } finally {
    server.close();
  }
});
