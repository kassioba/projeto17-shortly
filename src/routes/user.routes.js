import { Router } from "express";
import { signInValidation, signUpValidation } from "../middlewares/user.middlewares.js";
import { getMe, getRanking, userSignIn, userSignUp } from "../controllers/user.controllers.js";

const userRouter = Router()

userRouter.post('/signup', signUpValidation, userSignUp)
userRouter.post('/signin', signInValidation, userSignIn)
userRouter.get('/users/me', getMe)
userRouter.get('/ranking', getRanking)

export default userRouter