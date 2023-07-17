import express from 'express';
const router = express.Router();

import {
    allProducts,
    // getProduct,
    // addProduct,
    // updateProduct,
    // deleteProduct,
    // venueBasedProducts,
    // searchProductByName,
    addMenu,
    getMenu,
} from "../controllers/product.js"

// router.get('/',allProducts)
// router.get('/:productId',getProduct)
// router.post('/',addProduct)
// router.patch('/:productId',updateProduct)
// router.delete('/:productId',deleteProduct)
// // router.get('/venue/:venue',venueBasedProducts)
// router.get('/search/:key', searchProductByName)

router.get('/:venue',allProducts)
router.post("/:venue/addtomenu", addMenu)
router.get('/:venue/menu',getMenu)
export default router;