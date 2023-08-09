import path from "path";
import Product from "../models/product.js";
import Menu from "../models/menu.js";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { sse } from "../routes/sseRoute.js";

import { ObjectId } from "mongodb";

export const allProducts = async (req, res) => {
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
};

export const getProduct = async (req, res) => {
  const { productId } = req.params;
  console.log(productId);
  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProductImage = async (req, res) => {
  const { fileName } = req.params;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    const imagePath = path.join(__dirname, "../uploads/public", fileName);
    const imageBuffer = await fs.readFile(imagePath);
    res.send(imageBuffer);
  } catch (err) {
    console.error("Error reading file:", err);
    res.status(500).json({ error: err });
  }
};

export const addProduct = async (req, res) => {
  const newProductDetails = req.body;
  try {
    // Get the latest product ID
    const latestProduct = await Product.findOne(
      {},
      { productId: 1 },
      { sort: { productId: -1 } }
    );

    let counter = 1;
    if (latestProduct) {
      const latestProductId = parseInt(latestProduct.productId.split("-")[1]);
      counter = latestProductId + 1;
    }

    const newProductId = `item-${counter.toString().padStart(2, "0")}`;

    const newProduct = new Product({
      productId: newProductId,
      ...newProductDetails,
    });

    const savedProduct = await newProduct.save();
    if (!savedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    sse.send(savedProduct, "newProduct");
    return res.json({
      msg: "Product created successfully",
      savedProduct,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const updateProductDetails = req.body;
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      { $set: updateProductDetails },
      { new: true }
    );
    if (!updatedProduct) {
      return res.json({ message: "Product not found" });
    }
    return res.json({
      msg: "Updated Product Details",
      updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    // Delete the product

    const deletedProduct = await Product.findOneAndDelete({
      productId: productId,
    });

    if (!deletedProduct) {
      return res.json({ message: "Product not found" });
    }
    // Find products with a product ID greater than the deleted product's ID
    const productsToUpdate = await Product.find({
      productId: { $gt: productId },
    });

    // Update the product IDs for the remaining products
    for (const product of productsToUpdate) {
      const currentProductId = product.productId;
      const numericPart = parseInt(currentProductId.split("-")[1]) - 1;
      const updatedProductId = `item-${numericPart
        .toString()
        .padStart(2, "0")}`;

      product.productId = updatedProductId;
      await product.save();
    }
    sse.send(deletedProduct, "productDeleted");

    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// // export const venueBasedProducts = async (req, res) => {
// //     const { venue } = req.params;
// //     try {
// //       const products = await Product.find({ venue });
// //       res.json(products);
// //     } catch (err) {
// //       res.status(500).json({ error: 'Internal Server Error' });
// //     }
// // }

// export const searchProductByName = async (req, res) => {
//   try {
//     const products = await Product.find(
//       {
//         "$or":[
//           {item:{$regex:req.params.key}}
//         ]
//       }
//     );

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const addMenu = async (req, res) => {
  const { venue } = req.params;
  const { productIds } = req.body;

  try {
    const existingProductIds = await Menu.distinct("productId");

    const newProductIds = productIds.filter(
      (productId) => !existingProductIds.includes(productId)
    );

    if (newProductIds.length === 0) {
      return res.status(200).json({ message: "No new products to add" });
    }

    const newProducts = await Product.find({
      productId: { $in: newProductIds },
    });

    const menuItems = newProducts.map((product) => ({
      ...product.toObject(),
      _id: new ObjectId(),
      productId: `${product.productId
        .toLowerCase()
        .replace(/\s+/g, "-")}_${venue}`,
      venue,
    }));

    await Menu.insertMany(menuItems);

    res.status(200).json({ message: "Menu items added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMenu = async (req, res) => {
  const { venue } = req.params;
  try {
    const products = await Menu.find({ venue });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMenuItem = async (req, res) => {
  const venue = req.params.venue;
  const productId = req.params.productId;

  try {
    // const products = await Menu.find({ venue });
    const deletedMenuItem = await Menu.findOneAndDelete({
      productId: productId,
    });
    if (!deletedMenuItem) {
      return res.json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Menu items deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteAllMenuItem = async (req, res) => {
  const venue = req.params.venue;
  console.log(venue);
  // const productId = req.params.productId;

  try {
    // const products = await Menu.find({ venue });
    const deletedAllMenuItem = await Menu.deleteMany({ venue });
    if (!deletedAllMenuItem) {
      return res.json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Menu items deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
