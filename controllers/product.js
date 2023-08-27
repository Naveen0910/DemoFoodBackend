import path from "path";
import Product from "../models/product.js";
import Menu from "../models/menu.js";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { sse } from "../routes/sseRoute.js";

import { ObjectId } from "mongodb";

export const allProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { item: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const products = await Product.find({ ...keyword });
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
  const menuItemsToAdd = req.body; // An array of { productId, plate } objects
  console.log(menuItemsToAdd);
  try {
    const existingProductIds = await Menu.distinct("productId");
    const newMenuItems = [];
    const processedProductIds = new Set(); // To keep track of processed productIds

    for (const item of menuItemsToAdd) {
      const { productId, plates } = item;

      const processedProductId = `${productId
        .toLowerCase()
        .replace(/\s+/g, "-")}_${venue}`;

      // Skip if this processedProductId has been processed before
      if (processedProductIds.has(processedProductId)) {
        continue;
      }

      if (existingProductIds.includes(processedProductId)) {
        // Product already exists in the menu, update its plates
        await Menu.updateOne(
          { productId: processedProductId },
          { $set: { plates: parseInt(plates) } }
        );
      } else {
        // Product doesn't exist in the menu, try to find it in Products
        const newProduct = await Product.findOne({ productId });

        if (newProduct) {
          const newMenuItem = {
            ...newProduct.toObject(),
            _id: new ObjectId(),
            productId: processedProductId,
            venue,
            plates: plates,
          };

          newMenuItems.push(newMenuItem);
          processedProductIds.add(processedProductId); // Mark as processed
        }
      }
    }

    // Insert new menu items
    if (newMenuItems.length > 0) {
      await Menu.insertMany(newMenuItems);
    }
    sse.send(newMenuItems, "menuCreation");
    res.status(200).json({ message: "Menu items added/updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMenuItem = async (req, res) => {
  const { productId, venue } = req.params;
  console.log(productId);
  try {
    const product = await Menu.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMenu = async (req, res) => {
  const { venue } = req.params;
  console.log(req.query);
  try {
    const keyword = req.query.keyword
      ? { item: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const products = await Menu.find({ ...keyword });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

/* Review Products Controller */
export const createProductReview = async (req, res) => {
  const { name, rating, comment } = req.body;
  const { productId } = req.params;

  console.log(name, rating, comment, productId);

  try {
    const product = await Product.findOne({ productId: productId });
    if (product) {
      const review = {
        name,
        comment,
        rating: Number(rating),
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
      const newReview = await product.save();
      res.status(201).json({ message: "Review Added" });
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (err) {
    console.log({ error: err });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* Get Product Image  */
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
