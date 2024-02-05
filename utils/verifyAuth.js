import jwt from "jsonwebtoken";
import { errorHandler } from "./errorHandler.js";

export const verifyUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const verify = jwt.verify(token, "chat", (err, user) => {
      if (err) {
        return next(errorHandler(400, "Auth failed"));
      } else {
        (req.user = user), next();
      }
    });
  } else {
    next(errorHandler(400, "Auth is required"));
  }
};
