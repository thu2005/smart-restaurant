const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get environment prefix for folder structure
const envPrefix = process.env.NODE_ENV === "production" ? "prod" : "dev";

// Storage for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `smart-restaurant/${envPrefix}/avatars`,
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 400, height: 400, crop: "fill" },
      { quality: "auto" },
    ],
    public_id: (req, file) => {
      return `avatar-${req.user.id}-${Date.now()}`;
    },
  },
});

// Storage for menu item images
const menuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `smart-restaurant/${envPrefix}/menu-items`,
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 800, height: 600, crop: "fit" },
      { quality: "auto" },
    ],
    public_id: (req, file) => {
      return `menu-${Date.now()}`;
    },
  },
});

module.exports = {
  cloudinary,
  avatarStorage,
  menuStorage,
};
