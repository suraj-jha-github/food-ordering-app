import express from "express";
import { loginUser, registerUser, validateToken } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/validate", validateToken);

export default userRouter;
