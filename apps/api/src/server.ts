import cors from "cors";

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
