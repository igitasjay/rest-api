const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const ProductsController = require("../controllers/products");

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

router.get("/", ProductsController.get_all_products);

// router.post("/", upload.single("productImage"), checkAuth, (req, res, next) => {
router.post("/", checkAuth, ProductsController.create_new_product);

router.get("/:productId", ProductsController.get_one_product);

router.patch("/:productId", checkAuth, ProductsController.update_product);

router.delete("/:productId", checkAuth, ProductsController.delete_product);

module.exports = router;
