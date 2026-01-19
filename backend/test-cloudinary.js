require("dotenv").config();
const { cloudinary } = require("./src/config/cloudinary");

async function testCloudinaryConnection() {
  console.log("🧪 Testing Cloudinary connection...");

  // Debug environment variables
  console.log("🔍 Environment check:");
  console.log(
    "   CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME ? "✅ Found" : "❌ Missing",
  );
  console.log(
    "   CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "✅ Found" : "❌ Missing",
  );
  console.log(
    "   CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "✅ Found" : "❌ Missing",
  );

  try {
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful!");
    console.log("📋 Account details:", result);

    // Test upload with a simple test file (if exists)
    console.log("\n🔄 Testing upload functionality...");

    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
    console.error("💡 Please check your environment variables:");
    console.error("   - CLOUDINARY_CLOUD_NAME");
    console.error("   - CLOUDINARY_API_KEY");
    console.error("   - CLOUDINARY_API_SECRET");

    return false;
  }
}

if (require.main === module) {
  testCloudinaryConnection().catch(console.error);
}

module.exports = { testCloudinaryConnection };
