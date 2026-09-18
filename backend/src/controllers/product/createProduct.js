import productSchema from "../../models/productSchema.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;
    const sellerId = req.userId;

    if (req.role !== "seller") {
      return res.status(401).json({
        success: false,
        message: "Unauthorised access",
      });
    }

    // Ensure image is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No product image uploaded. Please add an image.",
      });
    }

    // Upload buffer to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      "ekart/products"
    );

    const data = await productSchema.create({
      name,
      category,
      description,
      price,
      pic: cloudinaryResult.secure_url,
      sellerId,
    });

    return res.status(200).json({
      success: true,
      message: "Product created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
