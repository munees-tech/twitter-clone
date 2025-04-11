import jwt from "jsonwebtoken"

const genrateToken = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
        expiresIn: "15d"
    })

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,
        sameSite: "strict", // "strict" can block cross-origin cookies
        secure: process.env.NODE_ENV !== "development",
      });
      
}

export default genrateToken 