export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const asyncHandler=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export function errorHandler(err,req,res,next){ if(res.headersSent)return next(err); const status=Number.isInteger(err.status)?err.status:500; if(status>=500) console.error('request_failed', {status,method:req.method,path:req.path}); res.status(status).json({success:false,error:status>=500?'Internal server error':(err.message||'Request failed')}); }
