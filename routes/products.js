import express from 'express';
import Product from '../models/product.js';

const router = express.Router();

router.get('/', async(req,res) => {
    try{
        const products = await Product.find()
        res.json(products)

    } catch(err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/:id', async(req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router.post('/', async(req,res) => {
    const productDetails = req.body;

    try{
        const newProduct = new Product(productDetails)
        const createdProduct = await newProduct.save()
        res.json({
            msg: 'New Product Added',
            createdProduct
        })

    }catch(err){
        res.status(500).json({ message: err.message });
    }
})

router.patch('/:id', async(req,res) => {
    const { id } = req.params
    const updateProductDetails = req.body
    try{
        const updatedProduct = await Product.findByIdAndUpdate(id,{ $set: updateProductDetails }, { new: true })
        if(!updatedProduct){
            res.json({ message: 'Product not found' });
        }
        res.json({
            msg: 'Updated Product Details',
            updatedProduct
        })
    }catch(err){
        res.status(500).json({ message: err.message });
    }
})

router.delete('/:id', async(req,res) => {
    const { id } = req.params;
    try{
        const deletedProduct = await Product.findByIdAndDelete(id)
        res.json({
            msg: "Product Deleted",
            deletedProduct
        })
    }catch(err){
        res.status(500).json({ message: err.message });
    }
})

export default router;