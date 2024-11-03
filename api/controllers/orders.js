const Order = require("../routes/orders");
const mongoose = require("mongoose");
const Product = require("../model/product");
// const router = express.Router();

exports.get_all_orders = (req, res, next) => {
  Order.find()
    .select("_id product quantity")
    .populate("product", "name")
    .exec()
    .then((docs) => {
      res.status(200).json({
        statusCode: 200,
        message: "Orders fetched successfully",
        count: docs.length,
        order: docs,
        request: {
          type: "GET",
          description: "Fetch all orders",
          url: "https://localhost:3000/orders/",
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        error: error.message,
      });
    });
};

exports.create_order = (req, res, next) => {
  // We want to mak sure that orders can only be created from IDs of products that have actually been created (products that exist on the database)
  Product.findById(req.body.productId)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        productId: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        statusCode: 201,
        message: "Order created successfully",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        order: result,
        request: {
          type: "POST",
          url: "http://localhost:3000/orders",
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    });
};

exports.get_one_product = (req, res, next) => {
  Order.findById(req.params.orderId)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: "Order not found",
        });
      }
      res.status(200).json({
        statusCode: 200,
        message: "Order found",
        order: order,
        request: {
          type: "GET",
          url: "https://localhost:3000/orders/" + req.params.orderId,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        error: error.message,
      });
    });
};

exports.delete_product = (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: "Order not found",
        });
      }
      res.status(200).json({
        statusCode: 200,
        message: "Order deleted",
        request: {
          type: "DELETE",
          url: "https://localhost:3000/orders/" + id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    });
};
