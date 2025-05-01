import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import notification from "./routes/notification.route.js"
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/postRoute.js"
import connectDb from "./db/connectMongodb.js"
import cloudinary from "cloudinary"
import cors from "cors"
import path from "path"
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECREAT_KEY,
});
const app = express()
const __dirname = path.resolve()

app.use(cors({
    origin: "https://twitter-clone-1-933p.onrender.com",
    credentials: true
}));

const port = process.env.PORT
app.use(express.json(
    {
        limit: "5mb"
    }
))

app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/posts", postRoute)
app.use("/api/notification", notification)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")))
    app.use("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
    })
} 

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    connectDb()
})
