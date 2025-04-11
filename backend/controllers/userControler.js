import Notificaton from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"
export const getProfile = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({ username })
        if (!user) {
            res.status(400).json({ error: "username Not Found" })
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(`userControler Error ${error}`)
        res.status(500).json({ error: "Internal server Error" })
    }
}
export const followunfollowuser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById({ _id: id })
        const currentUser = await User.findById({ _id: req.user.id })

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            // Follow
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            //send Notification
            const newNotification = new Notificaton({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save()
            return res.status(200).json({ message: "Follow successfully" });
        }
    } catch (error) {
        console.log(`follow unfollow${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id
        const userfollowedMe = await User.findById(userId).select("-password")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        const filterdUser = users.filter((user) => !userfollowedMe.following.includes(user._id))
        const suggestedUser = filterdUser.slice(0, 4)

        suggestedUser.forEach((user) => (user.password = null))
        return res.status(200).json(suggestedUser)

    } catch (error) {
        console.log(`suggested Error ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, fullName, email, currentPassword, newPassword, link, bio } = req.body;
        let { profileImg, coverImg } = req.body;

        let user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(400).json({ error: "User not Found" });
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please Provide both newPassword and currentPassword" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Enter correct current password" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "New Password should be at least 6 characters" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            await cloudinary.uploader.destroy(user.profileimg.split("/").pop().split(".")[0]);
            const uploadRes = await cloudinary.uploader.upload(profileImg);
            user.profileimg = uploadRes.secure_url;
        }

        if (coverImg) {
            await cloudinary.uploader.destroy(user.coverimg.split("/").pop().split(".")[0]);
            const uploadRes = await cloudinary.uploader.upload(coverImg);
            user.coverimg = uploadRes.secure_url;
        }

        user.fullname = fullName || user.fullname;
        user.username = username || user.username;
        user.email = email || user.email;
        user.link = link || user.link;
        user.bio = bio || user.bio;

        user = await user.save();
        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log(`updateProfile Error ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
