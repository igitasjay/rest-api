const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const productRoute = require("./api/routes/products");
const orderRoute = require("./api/routes/orders");
const userRoute = require("./api/routes/users");
const dotenv = require("dotenv").config();

dotenv.config();

// connect to mongo DB
mongoose
  .connect(
    "mongodb+srv://iamjaypegg:" +
      process.env.MONGO_ATLAS_PASSWORD +
      "@node-shop.ena66.mongodb.net/?retryWrites=true&w=majority&appName=node-shop"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
mongoose.Promise = global.Promise;

app.use(morgan("dev")); // morgan logs the API response
app.use(express.static("/uploads"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  }) // body-parser parses the request body
);

app.use(bodyParser.json());

// Manage which domains can access your API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" typically means any domain can access it. if you would limit it, you'd provide the url you want to access it. Like "https://your-url.com"
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    // this is where you set all the http methods you want to enable
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200), json({});
  }
  // call the next() method to make it move to the next middleware, since this particular one doesn't return anything.
  next();
});

// your API routes here
app.use("/products", productRoute);
app.use("/orders", orderRoute);
app.use("/user", userRoute);

// error handling
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
