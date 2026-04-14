const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:userId", userController.getUserProfile);
userRouter.put("/updateProfile/:userId", userController.updateUserProfile);
userRouter.delete("/deleteProfile/:userId", userController.deleteUserProfile);

module.exports = userRouter;