import pinoHttp from "pino-http";

import { env } from "../config/env";
import { logger } from "../config/logger";

export const httpLogger = pinoHttp({
  logger,

  autoLogging: env.NODE_ENV !== "test",

  quietReqLogger: true,
  quietResLogger: true,

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },

  customProps: (req) => ({
    id: req.id,
  }),

  customSuccessMessage: (req, res, responseTime) =>
    `${req.method} ${req.url} ${res.statusCode} ${Math.round(responseTime)}ms`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
});