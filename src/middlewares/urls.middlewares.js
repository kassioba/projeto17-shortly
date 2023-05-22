import { urlSchema } from "../schemas/urls.schema.js";

export function urlValidation(req, res, next){
    const validation = urlSchema.validate(req.body)

    if(validation.error) return res.sendStatus(422)
 
    next()
}