import express from "express"
import productRoute from "../middlewere/productRoute.js"
import { createPost , deletePost , commentOnPost , likeUnlikePost , getAllPosts, getLikedPosts , getFollowingPosts , getUserPosts} from "../controllers/post.controller.js"

const router = express.Router()

router.get("/all",productRoute,getAllPosts)
router.get("/user/:username",productRoute,getUserPosts)
router.get("/following",productRoute,getFollowingPosts)
router.post("/create",productRoute,createPost)
router.post("/comment/:id",productRoute,commentOnPost)
router.get("/likes/:id",productRoute,getLikedPosts)
router.post("/like/:id",productRoute,likeUnlikePost)
router.delete("/:id",productRoute,deletePost)

export default router