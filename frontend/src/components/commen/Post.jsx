import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/db/data";
import { base_url } from "../constant/url";

const Post = ({ post }) => {
    const [comment, setComment] = useState("");
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await fetch(`${base_url}/api/auth/me`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            console.log(data)

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch user data");
            }

            return data;
        },
    });

    console.log(post)
    const postOwner = post.user;
    console.log(postOwner)
    const isLiked = authUser ? post.likes.includes(authUser._id) : false;
    const isMyPost = authUser && post.user ? authUser._id === post.user._id : false;
    const formattedDate = formatPostDate(post.createdAt);

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${base_url}/api/posts/${post._id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${base_url}/api/posts/like/${post._id}`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            return data;
        },
        onSuccess: (updatedLikes) => {
            queryClient.setQueryData(["posts"], (oldData) => {
                return oldData.map((p) => {
                    if (p._id === post._id) {
                        return { ...p, likes: updatedLikes };
                    }
                    return p;
                });
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: commentPost, isPending: isCommenting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${base_url}/api/posts/comment/${post._id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: comment }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Comment posted successfully");
            setComment("");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDeletePost = () => {
        deletePost();
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (isCommenting) return;
        commentPost();
    };

    const handleLikePost = () => {
        if (isLiking) return;
        likePost();
    };

    return (
        <div className='flex gap-2 items-start p-4 border-b border-gray-700'>
            <div className='avatar'>
                <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                    <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
                </Link>
            </div>
            <div className='flex flex-col flex-1'>
                <div className='flex gap-2 items-center'>
                    <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                        {postOwner.fullName}
                    </Link>
                    <span className='text-gray-700 flex gap-1 text-sm'>
                        <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
                        <span>·</span>
                        <span>{formattedDate}</span>
                    </span>
                    {isMyPost && (
                        <span className='flex justify-end flex-1'>
                            {!isDeleting && (
                                <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
                            )}
                            {isDeleting && <LoadingSpinner size='sm' />}
                        </span>
                    )}
                </div>
                <div className='flex flex-col gap-3 overflow-hidden'>
                    <span>{post.text}</span>
                    {post.img && (
                        <img
                            src={post.img}
                            className='h-80 object-contain rounded-lg border border-gray-700'
                            alt=''
                        />
                    )}
                </div>
                <div className='flex justify-between mt-3'>
                    <div className='flex gap-4 items-center w-2/3 justify-between'>
                        <div
                            className='flex gap-1 items-center cursor-pointer group'
                            onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                        >
                            <FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
                            <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                {post.comment.length}
                            </span>
                        </div>
                        <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                            {isLiking && <LoadingSpinner size='sm' />}
                            {!isLiked && !isLiking && (
                                <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                            )}
                            {isLiked && !isLiking && (
                                <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
                            )}
                            <span
                                className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                                    }`}
                            >
                                {post.likes.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;