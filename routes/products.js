import express from 'express';
const router = express.Router();

import {
    allProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.js"

router.get('/',allProducts)
router.get('/:id',getProduct)
router.post('/',addProduct)
router.patch('/:id',updateProduct)
router.delete('/:id',deleteProduct)

export default router;