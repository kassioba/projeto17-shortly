import { Router } from "express";
import { urlValidation } from "../middlewares/urls.middlewares.js";
import { deleteUrl, getUrl, redirectToShortUrl, shortenUrl } from "../controllers/urls.controllers.js";

const urlsRouter = Router()

urlsRouter.post('/urls/shorten', urlValidation, shortenUrl)
urlsRouter.get('/urls/:id', getUrl)
urlsRouter.get('/urls/open/:shortUrl', redirectToShortUrl)
urlsRouter.delete('/urls/:id', deleteUrl)

export default urlsRouter