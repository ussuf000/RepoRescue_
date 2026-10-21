import jwt from 'jsonwebtoken'

 export async function authMiddleware(req,res,next) {

    const token=req.cookies.token;

    if(!token){
     return   res.status(401).json({
            message:"unauthroize"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Session is invalid or expired' });
    }
    
}
