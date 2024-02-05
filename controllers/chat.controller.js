import chatmodel from "../models/chat.model.js";
import usermodel from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";

export const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await chatmodel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await usermodel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = new chatmodel({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    try {
      await chatData.save();
      const FullChat = await chatmodel
        .findOne({ _id: chatData._id })
        .populate("users", "-password");
      res.status(200).json(FullChat);
    } catch (error) {
      next(error);
    }
  }
};

export const groupChat = async (req, res, next) => {
  if (!req.body.users) {
    return next(errorHandler(400, "users is required"));
  }
  const users = req.body.users;
  if (users.length < 2) {
    return next(
      errorHandler(400, "Atleast two member is needed to create a group")
    );
  }
  users.push(req.user._id);
  try {
    const newGroup = new chatmodel({
      chatName: req.body.chatName,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user._id,
    });
    await newGroup.save();
    let group = await chatmodel
      .findById(newGroup._id)
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin");
    group = await usermodel.populate(group, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};

export const fetchChats = async (req, res, next) => {
  try {
    let chats = await chatmodel
      .find({
        users: { $elemMatch: { $eq: req.user._id } },
      })
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chats = await usermodel.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

export const renameGroup = async (req, res, next) => {
  try {
    if (req.body.userId != req.user._id) {
      return next(errorHandler(400, "only admin can change"));
    }
    const group = await chatmodel.findById(req.params.id);
    if (group) {
      const group = await chatmodel
        .findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      res.status(200).json(group);
    } else {
      next(errorHandler(400, "Group not found"));
    }
  } catch (error) {
    console.log(error);
  }
};

export const addToGroup = async (req, res, next) => {
  if (req.body.userId != req.user._id) {
    return next(errorHandler(400, "only admin can add"));
  }
  try {
    const group = await chatmodel.findById(req.params.id);
    if (group) {
      const newGroup = await chatmodel
        .findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body.users,
          },
          { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      res.status(200).json(newGroup);
    } else {
      next(errorHandler(400, "Group not found"));
    }
  } catch (error) {
    next(error);
  }
};

export const removeFromGroup = async (req, res, next) => {
  if (req.body.userId != req.user._id) {
    return next(errorHandler(400, "only admin can add"));
  }
  try {
    const group = await chatmodel.findById(req.params.id);
    if (group) {
      const newGroup = await chatmodel
        .findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body.users,
          },
          { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      res.status(200).json(newGroup);
    } else {
      next(errorHandler(400, "Group not found"));
    }
  } catch (error) {
    next(error);
  }
};
