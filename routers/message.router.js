import express from "express";
const router = express.Router();
import { verifyUser } from "../utils/verifyAuth.js";
import { sendMsg, getMsg } from "../controllers/message.controller.js";

router.post("/sendmsg", verifyUser, sendMsg);
router.get("/getmsg/:id", verifyUser, getMsg);

export default router;
