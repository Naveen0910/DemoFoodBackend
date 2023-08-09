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
} from "../controllers/product.js";

// router.get('/',allProducts)
// router.get('/:productId',getProduct)
// router.post('/',addProduct)
// router.patch('/:productId',updateProduct)
// router.delete('/:productId',deleteProduct)
// // router.get('/venue/:venue',venueBasedProducts)
// router.get('/search/:key', searchProductByName)

//For all products
router.get("/:venue/products", allProducts);

router.get("/:venue/products/:productId", getProduct);
router.post("/:venue/products", addProduct);
router.patch("/:venue/products/:productId", updateProduct);
router.delete("/:venue/products/:productId", deleteProduct);
router.get("/products/:fileName", getProductImage);
//For Menu list
router.post("/:venue/products/addtomenu", addMenu);
router.get("/:venue/menu", getMenu);
router.delete("/:venue/menu/:productId", deleteMenuItem);
router.delete("/:venue/menu/delete/AllItems", deleteAllMenuItem);

export default router;
