import usermodel from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res, next) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (user) {
      const verify = await bcrypt.compare(req.body.password, user.password);
      if (verify) {
        const data = {
          _id: user._id,
          email: user.email,
        };
        const token = jwt.sign(data, "chat", { expiresIn: "30d" });
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });
      } else {
        next(errorHandler(400, "Incorrect username/password"));
      }
    } else {
      next(errorHandler(400, "user not found"));
    }
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (user) {
      next(errorHandler(400, "user exists"));
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const data = new usermodel({
        email: req.body.email,
        name: req.body.name,
        password: hash,
        pic: req.body.pic,
        isAdmin: req.body.isAdmin,
      });
      await data.save();
      res.status(200).json({ message: "user added" });
    }
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const email = req.query.email || "";
    let users = await usermodel.find({
      email: {
        $regex: email,
        $options: "i",
      },
    });
    users = users.filter((item) => item._id != req.user._id);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
