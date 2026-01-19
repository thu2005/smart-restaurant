require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { cloudinary } = require("./src/config/cloudinary");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Get current environment
const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

async function uploadImageToCloudinary(localPath, folder, publicId = null) {
  try {
    const options = {
      folder: `smart-restaurant/${env}/${folder}`,
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
        avatar: {
          startsWith: "/uploads/avatars/",
        },
      },
    });

    console.log(`Found ${users.length} users with local avatars`);

    for (const user of users) {
      const localPath = path.join(__dirname, "..", user.avatar);

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
            data: { avatar: cloudinaryUrl },
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

// Restaurant logos are hosted on ImageKit - skip this migration

async function main() {
  console.log(`🚀 Starting Cloudinary migration for ${env} environment...`);

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

    console.log("✅ Migration completed successfully!");
    console.log(
      "📝 Note: Restaurant logos are hosted on ImageKit and don't need migration.",
    );
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
};
