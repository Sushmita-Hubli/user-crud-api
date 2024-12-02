const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = 'uploads/images';

if (!fs.existsSync(uploadDirectory)){
    fs.mkdirSync(uploadDirectory, { recursive: true });
}


// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images');  // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid name collisions
    }
});


// Initialize multer with the storage configuration
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // Set 10MB limit, adjust as needed
});

const app = express();

app.use(express.json());

// routes
app.get('/', (req, res) => {
    res.send("Hellewww!!!");
});

// API for image uploading
app.post('/user/uploadImage/:id', upload.single('file'), async (req, res) => {
    try {
        console.log(req.file); 
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
   
        const imagePath = `/images/${req.file.filename}`;

        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save image path (or filename) to the user profile
        user.profileImage = imagePath;  // Assuming 'profileImage' field exists in the user model
        await user.save();

        res.status(200).json({
            message: 'Image uploaded successfully!',
            imagePath: imagePath
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Creating user
app.post('/user/create', upload.single('file'), async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Retrieving all users
app.get('/user/getAll', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


//Retriving one user by id
app.get('/user/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const users = await User.findById(id);
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


// Update the user
app.put('/user/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { fullname, password } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: `Cannot find user with id: ${id}` });
        }

        // Update only fullname and password fields
        if (fullname) {
            if (fullname.length < 3) {
                return res.status(400).json({ message: "Full Name must be at least 3 characters long" });
            }
            user.fullname = fullname;
        }

        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one number"
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a user
app.delete('/user/delete/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: `User with email ${email} not found` });
        }
        res.status(200).json({ message: "User deleted successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// MongoDB connection and server startup
mongoose.connect('mongodb+srv://hublisushmita7:Sushmita12@cluster0.ot0dj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        app.listen(4108, () => {
            console.log("Connected with MongoDB");
            console.log("Node App running on Port 4108");
        });
    })
    .catch((error) => {
        console.log(error);
    });
