import express from "express";
import { login, search, signin } from "../controllers/user.controller.js";
import { verifyUser } from "../utils/verifyAuth.js";
const router = express.Router();

router.post("/login", login);
router.post("/signin", signin);
router.get("/search", verifyUser, search);

export default router;
