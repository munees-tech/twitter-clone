import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import cloudinary from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};


export const deletePost = async (req, res) => {

    try {
        const { id } = req.params
        const post = await Post.findOne({ _id: id })

        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }

        if (post.user.toString() !== req.user.id.toString()) {
            return res.status(402).json({ error: "You not able to Delete this Post" })
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(id)

        return res.status(200).json({ message: "Post delete Succefully" })
    } catch (error) {
        console.log(`Error in delete ${error}`)
        res.status(500).json({ error: "Internal server Error" })
    }
}

export const createComment = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id

        if (!text) {
            return res.status(400).json({ error: "comment text requried" })
        }
        const post = await Post.findOne({ _id: postId })
        if (!post) {
            return res.status(400).json({ error: "Post not found" })
        }
        const comment = {
            user: userId,
            text
        }

        post.comment.push(comment)
        await post.save()
        res.status(200).json({ post })

    } catch (error) {
        console.log(`Error in commendPost ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const getAllPosts = async (req, res) => {
    try {

        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        })
            .populate({
                path: "comment.user",
                select: ["-password", "-email", "-following", "-followers", "-bio", "-link"]
            })
        if (posts.length === 0) {
            return res.status(200).json([])
        }
        res.status(200).json(posts)

    } catch (error) {
        console.log(`Error in getAllposts ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findOne({ _id: userId })

        if (!user) {
            return res.status(400).json({ error: "user not found" })
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })

            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comment.user",
                select: ["-password", "-email", "-following", "-followers", "-bio", "-link"]
            })
        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(`Error in getLikedPosts ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getfollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const following = user.following
        const feedPost = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comment.user",
                select: "-password"
            })
        res.status(200).json(feedPost)
    } catch (error) {
        console.log(`Error in getFollowlingPosts ${error.message}`)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({ username })
        if (!user) {
            res.status(400).json({ error: "User not found" })
        }
        const post = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comment.user",
                select: "-password"
            })
        res.status(200).json(post)
    } catch (error) {
        console.log(`Error in getUserPost ${error.message}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}