import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";
import Chat from "../models/ChatModel.js";
import ErrorHandler from "../utils/errorhandler.js";


//Send New Message
export const sendMessage = catchAsyncErrors(async(req,res,next) => {
    const { content, chatId } = req.body;

    if(!content || !chatId){
        console.log("Invalid data Passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name avatar");
        message = await message.populate("chat");
        message = await User.populate(message,{
            path: "chat.users",
            select: "name email avatar"
        });
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage: message,
        });
        res.json(message);
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get All Messages
export const allMessages = catchAsyncErrors(async(req,res,next) => {
    try {
        const messages = await Message.find({chat: req.params.chatId}).populate("sender","name avatar email").populate("chat");
        res.json(messages);
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});