import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
const productRoute = async (req,res,next)=>{
try {
    const token = req.cookies.jwt
    if(!token){
      return  res.status(400).json({error:"Token Not Found"})
    }

    const decode = jwt.verify(token,process.env.JWT_TOKEN)
    if(!decode) {
        return res.status(400).json({error:"Invaild Token"})
    }
    
    const user = await User.findOne({_id : decode.userId}).select("-password")

    if(!user){
        return res.status(400).json({error:"User Not Found"})
    }

    req.user = user
    next()
} catch (error) {
    console.log(`productRouteError${error}`)
    res.status(500).json({error:"Internal Server Error"})
}

}

export default productRoute