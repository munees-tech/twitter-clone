import express from "express"
import productRoute from "../middlewere/productRoute.js"
import { getProfile , followunfollowuser , getSuggestedUser , updateProfile } from "../controllers/userControler.js"
const router = express.Router()


router.get("/profile/:username", productRoute, getProfile)
router.post("/follow/:id", productRoute, followunfollowuser)
router.get("/suggested",productRoute,getSuggestedUser)
router.post("/update",productRoute,updateProfile)

export default router