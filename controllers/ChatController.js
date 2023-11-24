import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import Chat from "../models/ChatModel.js";
import User from "../models/UserModel.js";
import ErrorHandler from "../utils/errorhandler.js";

//Creating or Fetching a Chat
export const chat = catchAsyncErrors(async(req,res,next) => {
    const { userId } = req.body;
    if(!userId){
        console.log("User not found");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: {$eq: req.user._id} } },
            { users: { $elemMatch: {$eq: userId} } },
        ],
    }).populate("users","-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name email avatar",
    });

    if(isChat.length>0){
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };
        try {
            const createChat = await Chat.create(chatData);

            const getChat = await Chat.findOne({ _id:createChat._id }).populate("users","-password");
            res.status(200).send(getChat);
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
});

export const getAllChats = catchAsyncErrors(async(req,res,next) => {
    try {
        Chat.find({ users: {$elemMatch: { $eq: req.user._id } } })
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name email avatar",
            });
            res.status(200).send(results);
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const createGroup = catchAsyncErrors(async(req,res,next) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({ message: "Please fill all the fields" });
    }
    var users = JSON.parse(req.body.users);
    if(users.length<2){
        return res.status(400).send("At least two users are required to create a group");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const getGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password");
        res.status(200).json(getGroupChat);
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const renameGroup = catchAsyncErrors(async(req,res,next) => {
    const { chatId, chatName } = req.body;
    const updatedName = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!updatedName){
        return next(new ErrorHandler("Chat not found", 404));
    } else {
        res.json(updatedName);
    }
});

export const addNewMember = catchAsyncErrors(async(req,res,next) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!added){
        return next(new ErrorHandler("Chat not found", 404));
    } else {
        res.json(added);
    }
});

export const removeMember = catchAsyncErrors(async(req,res,next) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!removed){
        return next(new ErrorHandler("Chat not found", 404));
    } else {
        res.json(removed);
    }
});