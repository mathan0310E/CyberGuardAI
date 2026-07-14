import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cyber-guard-ai-web-mathan0310e.vercel.app",
      "https://cyber-guard-ai-web.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
