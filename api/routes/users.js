const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const UsersController = require("../controllers/users");

router.post("/signup", UsersController.signup_user);

router.post("/login", UsersController.login_user);

router.delete("/:userId", checkAuth, UsersController.delete_user);

module.exports = router;
