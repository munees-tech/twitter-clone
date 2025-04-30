import express from "express"
import productRoute from "../middlewere/productRoute.js"
import {getUserProfile , followUnfollowUser ,  getSuggestedUsers , updateUser } from "../controllers/userControler.js"
const router = express.Router()


router.get("/profile/:username", productRoute, getUserProfile)
router.post("/follow/:id", productRoute, followUnfollowUser)
router.get("/suggested",productRoute, getSuggestedUsers)
router.post("/update",productRoute,updateUser)

export default router