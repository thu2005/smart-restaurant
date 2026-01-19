const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-restaurant/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 400, height: 400, crop: 'fill' },
      { quality: 'auto' }
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
    folder: 'smart-restaurant/menu-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'fit' },
      { quality: 'auto' }
    ],
    public_id: (req, file) => {
      return `menu-${Date.now()}`;
    },
  },
});

// Storage for restaurant logos
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-restaurant/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 300, height: 300, crop: 'fit' },
      { quality: 'auto' }
    ],
    public_id: (req, file) => {
      return `logo-${Date.now()}`;
    },
  },
});

module.exports = {
  cloudinary,
  avatarStorage,
  menuStorage,
  logoStorage,
};