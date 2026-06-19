import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import musicRoutes from "./routes/musicRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", musicRoutes);

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
