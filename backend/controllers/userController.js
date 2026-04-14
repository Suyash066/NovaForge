const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await client.connect();
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch(err) {
        console.error("Error during fetching:", err.message);
        res.status(500).send("Server error!");
    }
};

const signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username: username,
            password: hashedPassword,
            email: email,
            repositories: [],
            followedUsers: [],
            starRepos: [],
        });

        const result = await user.save();
        const token = jwt.sign(
            { id: result._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" },
        );

        res.json({ token, userId: result._id });
    } catch(err) {
        console.error("Error signing in:", err.message);
        res.status(500).send("Server error!");
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            res.status(400).json("Invalid credentials!");
        }
    
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(!isMatch) {
            res.status(400).json("Invalid credentials!");
        }
    
        const token = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        )
    
        res.json({ token, userId: existingUser._id });
    } catch(err) {
        console.error("Error during login:", err.message);
        res.status(500).send("Server error!");
    };
};

const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json("User not found!");
        }

        res.json(user);

    } catch(err) {
        console.error("Error fetching user:", err.message);
        res.status(500).send("Server error!");
    }
};

const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { email, password } = req.body;

    try {
        const updateFields = {};
        if(email) {
            updateFields.email = email;
        }

        if(password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        const result = await User.findByIdAndUpdate(userId,
            updateFields,
            { new: true }
        )

        if(!result) {
            return res.status(404).json("User not found!");
        }

        res.json(result);

    } catch(err) {
        console.error("Error Updating User Profile:", err.message);
        res.status(500).send("Server error!");
    }
}

const deleteUserProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await User.findByIdAndDelete(userId);

        if(!result) {
            return res.status(404).json("User not found!");
        }

        res.json({ message: "User Profile Deleted!" });
    } catch(err) {
        console.error("Error Deleting User Profile:", err.message);
        res.status(500).send("Server error!");
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}

