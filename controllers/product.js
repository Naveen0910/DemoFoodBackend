import Product from '../models/product.js';
import { Types } from 'mongoose';


export const allProducts = async(req,res) => {
  try {
    const { item } = req.query;
    const queryObject = {};

    if (item) {
      queryObject.item = { $regex: item, $options: "i" };
    }

    const products = await Product.find(queryObject);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getProduct = async(req, res) => {
    const { productId } = req.params;
    try {
      const product = await Product.findOne({ productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
}


export const addProduct = async (req, res) => {
    const newProductDetails = req.body;
    try {
      // Get the latest product ID
      const latestProduct = await Product.findOne({}, { productId: 1 }, { sort: { productId: -1 } });
  
      let counter = 1;
      if (latestProduct) {
        // Extract the numeric part from the latest product ID
        const latestProductId = parseInt(latestProduct.productId.split('-')[1]);
        counter = latestProductId + 1;
      }

      const newProductId = `item-${counter.toString().padStart(2, '0')}`;

      const newProduct = new Product({
        productId: newProductId,
        ...newProductDetails,
      });
  
      const savedProduct = await newProduct.save();
      if (!savedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json({
        msg: 'Product created successfully',
        savedProduct,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  

export const updateProduct = async(req,res) => {
    const { productId } = req.params;
    const updateProductDetails = req.body
    try{
        const updatedProduct = await Product.findOneAndUpdate({ productId }, { $set: updateProductDetails }, { new: true })
        if(!updatedProduct){
            return res.json({ message: 'Product not found' });
        }
        return res.json({
            msg: 'Updated Product Details',
            updatedProduct
        })
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

  
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    try {
      // Delete the product
      const deletedProduct = await Product.findOneAndDelete({ productId: productId });
      if (!deletedProduct) {
        return res.json({ message: 'Product not found' });
      }
  
      // Find products with a product ID greater than the deleted product's ID
      const productsToUpdate = await Product.find({ productId: { $gt: productId } });
  
      // Update the product IDs for the remaining products
      for (const product of productsToUpdate) {
        const currentProductId = product.productId;
        const numericPart = parseInt(currentProductId.split('-')[1]) - 1;
        const updatedProductId = `item-${numericPart.toString().padStart(2, '0')}`;
  
        product.productId = updatedProductId;
        await product.save();
      }
  
      return res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  

export const venueBasedProducts = async (req, res) => {
    const { venue } = req.params;
    try {
      const products = await Product.find({ venue });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const searchProductByName = async (req, res) => {
  try {
    const products = await Product.find(
      {
        "$or":[
          {item:{$regex:req.params.key}}
        ]
      }
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
