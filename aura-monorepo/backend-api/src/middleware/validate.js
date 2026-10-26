import { HttpError } from './error.js';
export const validateBody=schema=>(req,res,next)=>{const result=schema.safeParse(req.body);if(!result.success)return next(new HttpError(400,'Invalid request body'));req.body=result.data;next();};
