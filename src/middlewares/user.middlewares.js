import {signUpSchema, signInSchema} from "../schemas/user.schema.js";

export function signUpValidation(req, res, next){
   const validation = signUpSchema.validate(req.body)

   if(validation.error) return res.sendStatus(422)

   next()
}

export function signInValidation(req, res, next){
    const validation = signInSchema.validate(req.body)
 
    if(validation.error) return res.sendStatus(422)
 
    next()
 }