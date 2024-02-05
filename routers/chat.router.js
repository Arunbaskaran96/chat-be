import express from "express";
import {
  accessChat,
  groupChat,
  fetchChats,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chat.controller.js";
import { verifyUser } from "../utils/verifyAuth.js";
const router = express.Router();

router.post("/accesschat", verifyUser, accessChat);
router.post("/groupchat", verifyUser, groupChat);
router.get("/fetchchats", verifyUser, fetchChats);
router.put("/rename-group/:id", verifyUser, renameGroup);
router.put("/addgroup/:id", verifyUser, addToGroup);
router.put("/removegroup/:id", verifyUser, removeFromGroup);
export default router;
