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
  [protect, isChef, isAdmin],
  updateProduct
);
router.delete("/:venue/products/:productId", [isAdmin, isChef], deleteProduct);
router.get("/products/:fileName", getProductImage);
//For Menu list
router.post("/:venue/products/addtomenu", [isChef, isAdmin], addMenu);
router.get("/:venue/menu", getMenu);
router.delete("/:venue/menu/:productId", [isChef, isAdmin], deleteMenuItem);
router.delete(
  "/:venue/menu/delete/AllItems",
  [isChef, isAdmin],
  deleteAllMenuItem
);
//Reviews
router.post("/:venue/products/review/:productId", protect, createProductReview);
export default router;
