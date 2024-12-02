const mongoose=require('mongoose')
const bcrypt = require('bcrypt');

const userSchema=mongoose.Schema(
{
    
       fullname: {
        type: String,
        required : [true, "Please Enter FullName"],
        minlength: [3, "Full Name must be at least 3 characters long"]
       },
    email: {
        type: String,
        required: [true,"Please enter email address"],
        unique: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"]

    },
    password: {
        type:String,
        required:[true,"Plase Enter Password"],
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function(v) {
                // Regex for strong password: Minimum 8 characters, at least one uppercase, one lowercase, and one number
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        }
    },
    profileImage: {
        type: String, // Add this field to store the file path of the uploaded image
    }
    
},
{
    timestamps:true
}
);

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});



const User= mongoose.model('User',userSchema);

module.exports=User;