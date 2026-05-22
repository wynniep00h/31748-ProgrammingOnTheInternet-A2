import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "register",
                "login", 
                "logout",
                "create_expense",
                "update_expense",
                "delete_expense",
            ],
        },
        details: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);