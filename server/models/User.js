import mongoose from "mongoose";
import bycrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true, //cannot have more than one users with same username
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            //add more conditions for password strength. eg. atleast a symbo; or number

        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    { timestamps: true }
);

//hash password before saving to database
userSchema.pre("save", async function (next) {
    //only has if password is modified or new
    if (!this.isModified("password")) 
        return next();
    const salt = await bycrypt.genSalt(12);
    this.password = await bycrypt.hash(this.password, salt);
    next();
});

//compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bycrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
