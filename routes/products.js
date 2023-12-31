import express from "express";
const router = express.Router();

import {
  allProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  // venueBasedProducts,
  // searchProductByName,
  addMenu,
  getMenu,
  deleteMenuItem,
  deleteAllMenuItem,
  getProductImage,
  createProductReview,
} from "../controllers/product.js";
import {
  adminOrChef,
  adminOrChefOrUser,
  isAdmin,
  isChef,
  protect,
} from "../middlewares/auth.js";

// router.get('/',allProducts)
// router.get('/:productId',getProduct)
// router.post('/',addProduct)
// router.patch('/:productId',updateProduct)
// router.delete('/:productId',deleteProduct)
// // router.get('/venue/:venue',venueBasedProducts)
// router.get('/search/:key', searchProductByName)

//For all products
router.get("/:venue/products", protect, isAdmin, allProducts);

router.get("/:venue/products/:productId", getProduct);
router.post("/:venue/products", protect, isAdmin, addProduct);
router.patch(
  "/:venue/products/:productId",
  protect,
  adminOrChef,
  updateProduct
);
router.delete(
  "/:venue/products/:productId",
  protect,
  adminOrChef,
  deleteProduct
);
router.get("/products/:fileName", getProductImage);
//For Menu list
router.post("/:venue/products/addtomenu", protect, adminOrChef, addMenu);
router.get("/:venue/menu", getMenu);
router.delete("/:venue/menu/:productId", protect, adminOrChef, deleteMenuItem);
router.delete(
  "/:venue/menu/delete/allitems",
  protect,
  adminOrChef,
  deleteAllMenuItem
);
//Reviews
router.post("/:venue/products/review/:productId", protect, createProductReview);
export default router;
