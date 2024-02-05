import chatmodel from "../models/chat.model.js";
import messagemodel from "../models/message.model.js";
import usermodel from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";

export const sendMsg = async (req, res, next) => {
  try {
    if (!req.body.content || !req.body.chatId) {
      next(errorHandler(400, ""));
    }
    let newMsg = new messagemodel({
      sender: req.user._id,
      content: req.body.content,
      chat: req.body.chatId,
    });
    await newMsg.save();
    newMsg = await newMsg.populate("sender", "name pic");
    newMsg = await newMsg.populate("chat");
    newMsg = await usermodel.populate(newMsg, {
      path: "chat.users",
      select: "name pic",
    });

    await chatmodel.findById(req.body.chatId);
    if (chatmodel) {
      await chatmodel.findByIdAndUpdate(req.body.chatId, {
        latestMessage: newMsg,
      });
    } else {
      next(errorHandler(400, "chat not found"));
    }
    res.status(200).json(newMsg);
  } catch (error) {
    next(error);
  }
};

export const getMsg = async (req, res, next) => {
  try {
    let messages = await messagemodel
      .find({ chat: req.params.id })
      .populate("sender", "name pic email")
      .populate("chat");
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
