import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { httpLogger } from "./middlewares/http-logger";
import { notFoundHandler } from "./middlewares/not-found";
import { apiRouter } from "./routes";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(httpLogger);

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: env.CORS_ORIGIN,
}));
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Backend service is running",
  });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
