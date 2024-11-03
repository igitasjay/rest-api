const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    // accept a file
    cb(null, true);
  } else {
    // reject a file
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: fileFilter,
});

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        statusCode: 200,
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            id: doc._id,
            productImage: doc.productImage,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

// router.post("/", upload.single("productImage"), checkAuth, (req, res, next) => {
router.post("/", checkAuth, (req, res, next) => {
  // console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    // productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        statusCode: 201,
        message: "Product created successfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          statusCode: 200,
          message: "Fetched product successfully",
          product: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + doc._id,
          },
        });
      } else {
        res.status(404).json({
          message: "Product not found",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOperations = {};

  // Construct the update object dynamically from the request body
  req.body.forEach((ops) => {
    updateOperations[ops.propName] = ops.value;
  });

  Product.updateOne({ _id: id }, { $set: updateOperations })
    .exec()
    .then((result) => {
      if (result.matchedCount > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Product updated successfully",
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + id,
          },
        });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product deleted",
        statusCode: 200,
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: {
            name: "String",
            price: "Number",
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
