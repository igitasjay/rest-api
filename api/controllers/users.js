const User = require("../model/user");
const bcrypt = require("bcrypt");

exports.signup_user = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Email already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err.message,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User created",
                  result: result,
                });
              })
              .catch((error) => {
                return res.status(500).json({
                  error: error.message,
                });
              });
          }
        });
      }
    });
};

exports.login_user = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
          error: "User not found",
        });
      }
      bcrypt.compare(
        req.body.password,
        user[0].password,
        (err, result, next) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed",
              error: err,
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token,
            });
          }
          res.status(401).json({
            message: "Auth failed",
          });
        }
      );
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

exports.delete_user = (req, res, next) => {
  User.find({ _id: req.params.userId })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        User.deleteOne({ _id: req.params.userId })
          .exec()
          .then((result) => {
            res.status(200).json({ message: "User deleted" });
          })
          .catch((error) => {
            return res.status(500).json({ error: error.message });
          });
      }
    });
};
