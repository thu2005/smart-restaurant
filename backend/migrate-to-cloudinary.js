const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../src/config/cloudinary").cloudinary;
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function uploadImageToCloudinary(localPath, folder, publicId = null) {
  try {
    const options = {
      folder: folder,
      resource_type: "image",
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(localPath, options);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return null;
  }
}

async function migrateAvatars() {
  console.log("🔄 Starting avatar migration...");

  try {
    const users = await prisma.user.findMany({
      where: {
        avatar_url: {
          startsWith: "/uploads/avatars/",
        },
      },
    });

    console.log(`Found ${users.length} users with local avatars`);

    for (const user of users) {
      const localPath = path.join(__dirname, "..", user.avatar_url);

      if (fs.existsSync(localPath)) {
        console.log(`Uploading avatar for user ${user.id}...`);

        const cloudinaryUrl = await uploadImageToCloudinary(
          localPath,
          "smart-restaurant/avatars",
          `avatar-${user.id}-${Date.now()}`,
        );

        if (cloudinaryUrl) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatar_url: cloudinaryUrl },
          });
          console.log(`✅ Updated user ${user.id} avatar`);
        } else {
          console.log(`❌ Failed to upload avatar for user ${user.id}`);
        }
      } else {
        console.log(`⚠️ File not found for user ${user.id}: ${localPath}`);
      }
    }
  } catch (error) {
    console.error("Error migrating avatars:", error);
  }
}

async function migrateMenuItemPhotos() {
  console.log("🔄 Starting menu item photos migration...");

  try {
    const photos = await prisma.menuItemPhoto.findMany({
      where: {
        url: {
          startsWith: "/uploads/",
        },
      },
    });

    console.log(`Found ${photos.length} menu item photos to migrate`);

    for (const photo of photos) {
      const localPath = path.join(__dirname, "..", photo.url);

      if (fs.existsSync(localPath)) {
        console.log(`Uploading photo ${photo.id}...`);

        const cloudinaryUrl = await uploadImageToCloudinary(
          localPath,
          "smart-restaurant/menu-items",
          `menu-${photo.id}-${Date.now()}`,
        );

        if (cloudinaryUrl) {
          await prisma.menuItemPhoto.update({
            where: { id: photo.id },
            data: { url: cloudinaryUrl },
          });
          console.log(`✅ Updated photo ${photo.id}`);
        } else {
          console.log(`❌ Failed to upload photo ${photo.id}`);
        }
      } else {
        console.log(`⚠️ File not found for photo ${photo.id}: ${localPath}`);
      }
    }
  } catch (error) {
    console.error("Error migrating menu item photos:", error);
  }
}

async function migrateRestaurantLogos() {
  console.log("🔄 Starting restaurant logos migration...");

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        logo_url: {
          startsWith: "/uploads/logos/",
        },
      },
    });

    console.log(`Found ${restaurants.length} restaurants with local logos`);

    for (const restaurant of restaurants) {
      const localPath = path.join(__dirname, "..", restaurant.logo_url);

      if (fs.existsSync(localPath)) {
        console.log(`Uploading logo for restaurant ${restaurant.id}...`);

        const cloudinaryUrl = await uploadImageToCloudinary(
          localPath,
          "smart-restaurant/logos",
          `logo-${restaurant.id}-${Date.now()}`,
        );

        if (cloudinaryUrl) {
          await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { logo_url: cloudinaryUrl },
          });
          console.log(`✅ Updated restaurant ${restaurant.id} logo`);
        } else {
          console.log(
            `❌ Failed to upload logo for restaurant ${restaurant.id}`,
          );
        }
      } else {
        console.log(
          `⚠️ File not found for restaurant ${restaurant.id}: ${localPath}`,
        );
      }
    }
  } catch (error) {
    console.error("Error migrating restaurant logos:", error);
  }
}

async function main() {
  console.log("🚀 Starting Cloudinary migration...");

  // Check if Cloudinary is configured
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error(
      "❌ Cloudinary credentials not configured in environment variables",
    );
    process.exit(1);
  }

  try {
    await migrateAvatars();
    await migrateMenuItemPhotos();
    await migrateRestaurantLogos();

    console.log("✅ Migration completed successfully!");
    console.log(
      "📝 You can now safely delete the local uploads folder if all images were migrated successfully.",
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  migrateAvatars,
  migrateMenuItemPhotos,
  migrateRestaurantLogos,
};
