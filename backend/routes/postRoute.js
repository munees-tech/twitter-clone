import express from "express"
import productRoute from "../middlewere/productRoute.js"
import { createPost , deletePost , createComment , likeUnlikePost,getAllPosts,getLikedPosts,getfollowingPosts,getUserPost} from "../controllers/post.controller.js"

const router = express.Router()

router.get("/all",productRoute,getAllPosts)
router.get("/user/:username",productRoute,getUserPost)
router.get("/following",productRoute,getfollowingPosts)
router.post("/create",productRoute,createPost)
router.post("/comment/:id",productRoute,createComment)
router.get("/likes/:id",productRoute,getLikedPosts)
router.post("/like/:id",productRoute,likeUnlikePost)
router.delete("/:id",productRoute,deletePost)

export default router