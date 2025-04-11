import Notificaton from "../models/notification.model.js"

export const getNotification = async (req,res) =>{
    try {
        const userId = req.user._id
        const notification = await Notificaton.find({to:userId})
       .populate({
            path : "from",
            select : "username profileImg"
        }) 

        await Notificaton.updateMany({to:userId},{read:true})
        res.status(200).json(notification)
    } catch (error) {
        console.log(`Error in getNotification ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const deleteNotification = async (req,res) =>{
    try {
        
        const userId = req.user._id

        await Notificaton.deleteMany({to:userId})

        res.status(200).json({message:"Notification deleted succesfully"})

    } catch (error) {
        console.log(`Error in deleteNotification ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}