import productSchema from "../../models/productSchema.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

export const updateProduct = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;
    let imageUrl = "";
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        "ekart/products"
      );
      imageUrl = cloudinaryResult.secure_url;
    }
    const sellerId = req.userId;
    console.log(name, category, description, price, sellerId, imageUrl);
    console.log("file", req.file);
    const productId = req.params.id;
    console.log(productId);
    if (req.role !== "seller")
      return res.status(401).json({
        success: false,
        message: "unauthorised access",
      });
    const product = await productSchema.findOne({
      sellerId: sellerId,
      _id: productId,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    console.log("pro", product);
    const image = product.pic;
    console.log("image", image);
    product.name = name;
    product.category = category;
    product.description = description;
    product.price = price;
    if (req.file !== undefined) {
      product.pic = imageUrl;
    } else {
      product.pic = image;
    }
    await product.save();
    console.log(product);

    return res.status(200).json({
      success: true,
      message: "product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default updateProduct;
