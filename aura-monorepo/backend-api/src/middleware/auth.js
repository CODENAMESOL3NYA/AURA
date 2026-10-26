import jwt from 'jsonwebtoken';
import { asyncHandler, HttpError } from './error.js';
import { env } from '../config/env.js';
import db from '../config/db.js';
export const signToken=user=>jwt.sign({sub:user.id,tv:user.token_version},env.JWT_SECRET,{algorithm:'HS256',issuer:'aura-api',expiresIn:'12h'});
export const requireAuth=asyncHandler(async(req,res,next)=>{const token=(req.get('authorization')||'').match(/^Bearer ([^ ]+)$/)?.[1];if(!token)throw new HttpError(401,'Authentication required');let payload;try{payload=jwt.verify(token,env.JWT_SECRET,{algorithms:['HS256'],issuer:'aura-api'});}catch{throw new HttpError(401,'Invalid or expired token');}const result=await db.query('SELECT id, role, token_version, full_name, stealth_enabled, phone_e164, phone_verified_at FROM users WHERE id=$1',[payload.sub]);const user=result.rows[0];if(!user||user.token_version!==payload.tv)throw new HttpError(401,'Invalid or expired token');req.user=user;next();});
export const requireRole=(...roles)=>(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return next(new HttpError(403,'Forbidden'));next();};
