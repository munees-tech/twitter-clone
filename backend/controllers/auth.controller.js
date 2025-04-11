import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import genrateToken from '../utils/genrateToken.js';


export const signup = async (req, res) => {
	try {
		const { fullname, username, email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
				if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
            fullname,
			username,
			email,
	        password: hashedPassword,
		});

if (newUser) {
		genrateToken(newUser._id, res);
		await newUser.save();

		res.status(201).json({
			_id: newUser._id,
            fullname: newUser.fullname,
			username: newUser.username,
			email: newUser.email,
			followers: newUser.followers,
			following: newUser.following,
			profileImg: newUser.profileImg,
			coverImg: newUser.coverImg,
			});
		} else {
			return res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const {username,password} = req.body;
		const user = await User.findOne({username})
		const isPassword = await bcrypt.compare(password,user.password || "")
		
    if(!user || !isPassword){
			return res.status(400).json({error:"Invalid username or password" })
		}
		genrateToken(user._id,res)

		res.status(200).json({
			_id:user._id,
            username: user.username,
            email: user.email,
			fullname: user.fullname,
			followers: user.followers,
            following: user.following,
            profileimg: user.profileimg,
            coverimg: user.coverimg,
            bio: user.bio,
			link: user.link
		})
	} catch (error) {
		console.log(`Login Error ${error.message}`)
	}
}

export const logout = async (req, res) => {
	try {
res.cookie("jwt","",{maxAge:0},)
        res.status(200).json({message:"Logout Succesfully"})

	} catch (error) {
		console.log(`Logout Error ${error.message}`)
		res.send("Internal Server Error")
	}
}
export const getMe = async(req,res) =>{
    try {
        const user = await User.findOne({_id : req.user._id}).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.log(`Get Me Error ${error.message}`)
       return res.status(500).send("Internal Server Error")
    }
}