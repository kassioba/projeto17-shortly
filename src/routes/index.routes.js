import { Router } from "express";
import userRouter from "./user.routes.js";
import urlsRouter from "./urls.routes.js";

const router = Router()

router.use(userRouter)
router.use(urlsRouter)

export default router