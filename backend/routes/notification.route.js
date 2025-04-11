import express from "express"
import productRoute from "../middlewere/productRoute.js"
import { getNotification,deleteNotification } from "../controllers/notification.controller.js"
const router = express.Router()

router.get("/",productRoute,getNotification)
router.delete("/",productRoute,deleteNotification)

export default router