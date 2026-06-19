import express from "express";
import {
  searchSongs,
  streamAudio,
  getSongDetails,
  getRelatedSongs,
} from "../controllers/musicController.js";

const router = express.Router();

router.get("/search", searchSongs);
router.get("/stream/:videoId", streamAudio);
router.get("/song/:videoId", getSongDetails);
router.get("/related/:videoId", getRelatedSongs);

export default router;
