const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // 1. Clean up database
  console.log("🗑️  Clearing old data...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItemModifierGroup.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItemPhoto.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();

  // 2. Create Restaurant
  console.log("🏪 Creating Restaurant...");
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Café Poirot",
      description:
        "Fine dining experience with modern Vietnamese-French fusion cuisine",
      address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
      phone: "+84 28 3823 4567",
      email: "contact@cafepoirot.com",
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      openingHours: {
        monday: { open: "08:00", close: "22:00" },
        tuesday: { open: "08:00", close: "22:00" },
        wednesday: { open: "08:00", close: "22:00" },
        thursday: { open: "08:00", close: "22:00" },
        friday: { open: "08:00", close: "23:00" },
        saturday: { open: "09:00", close: "23:00" },
        sunday: { open: "09:00", close: "22:00" },
      },
    },
  });

  // 3. Create Users
  console.log("👥 Creating Users...");
  const hashedPassword = await bcrypt.hash("password123", 10); // Strong password

    // Super Admin
    await prisma.user.create({
        data: {
            email: 'superadmin@system.com',
            password: hashedPassword,
            fullName: 'Karasuma Renya',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true
        }
    });

    // Restaurant Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@cafepoirot.com',
            password: hashedPassword,
            fullName: 'Juzo Megure',
            role: 'ADMIN',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true,
            phone: '+84 90 123 4567'
        }
    });

    // Waiter
    const waiter = await prisma.user.create({
        data: {
            email: 'waiter@cafepoirot.com',
            password: hashedPassword,
            fullName: 'Amuro Tooru',
            role: 'WAITER',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true,
            phone: '+84 90 234 5678'
        }
    });

    // Kitchen Staff
    const kitchen = await prisma.user.create({
        data: {
            email: 'chef@cafepoirot.com',
            password: hashedPassword,
            fullName: 'Yusaku Kudo',
            role: 'KITCHEN',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true,
            phone: '+84 90 345 6789'
        }
    });

    // Customers
    const customer1 = await prisma.user.create({
        data: {
            email: 'customer1@gmail.com',
            password: hashedPassword,
            fullName: 'Hattori Heij',
            role: 'CUSTOMER',
            isActive: true,
            emailVerified: true,
            phone: '+84 90 456 7890'
        }
    });

    const customer2 = await prisma.user.create({
        data: {
            email: 'customer2@gmail.com',
            password: hashedPassword,
            fullName: 'Kazuha Toyama',
            role: 'CUSTOMER',
            isActive: true,
            emailVerified: true,
            phone: '+84 90 567 8901'
        }
    });

    // 4. Create Tables
    console.log('🪑 Creating Tables...');
    const tables = [];
    for (let i = 1; i <= 15; i++) {
        tables.push(await prisma.table.create({
            data: {
                tableNumber: `T${String(i).padStart(2, '0')}`,
                capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
                location: i <= 5 ? 'Ground Floor' : i <= 10 ? 'First Floor' : 'Terrace',
                restaurantId: restaurant.id,
                qrCode: `QR_TABLE_${i}_${Date.now()}`,
                status: i === 1 || i === 8 || i === 12 || i === 14 ? 'OCCUPIED' : i === 2 || i === 11 ? 'RESERVED' : i === 15 ? 'CLEANING' : 'AVAILABLE'
            }
        }));
    }

  // 5. Create Categories
  console.log("📂 Creating Categories...");
  const catAppetizers = await prisma.category.create({
    data: {
      name: "Appetizers",
      description: "Start your meal right",
      displayOrder: 1,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  const catSoups = await prisma.category.create({
    data: {
      name: "Soups & Salads",
      description: "Fresh and healthy",
      displayOrder: 2,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  const catMains = await prisma.category.create({
    data: {
      name: "Main Courses",
      description: "Our signature dishes",
      displayOrder: 3,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  const catSeafood = await prisma.category.create({
    data: {
      name: "Seafood",
      description: "Fresh from the ocean",
      displayOrder: 4,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  const catDrinks = await prisma.category.create({
    data: {
      name: "Beverages",
      description: "Refresh yourself",
      displayOrder: 5,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  const catDesserts = await prisma.category.create({
    data: {
      name: "Desserts",
      description: "Sweet endings",
      displayOrder: 6,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  // 6. Create Modifier Groups
  console.log("🔧 Creating Modifiers...");

  const modSpicy = await prisma.modifierGroup.create({
    data: {
      name: "Spiciness Level",
      selectionType: "single",
      modifierType: "choice", // CHOICE type
      isRequired: true,
      restaurantId: restaurant.id,
      options: {
        create: [
          { name: "Mild", priceAdjustment: 0 },
          { name: "Medium", priceAdjustment: 0 },
          { name: "Hot", priceAdjustment: 0 },
          { name: "Extra Hot", priceAdjustment: 5000 },
        ],
      },
    },
  });

  const modSides = await prisma.modifierGroup.create({
    data: {
      name: "Add Sides",
      selectionType: "multiple",
      modifierType: "addon", // ADDON type
      isRequired: false,
      maxSelections: 3,
      restaurantId: restaurant.id,
      options: {
        create: [
          { name: "French Fries", priceAdjustment: 25000 },
          { name: "Garden Salad", priceAdjustment: 30000 },
          { name: "Mashed Potato", priceAdjustment: 25000 },
          { name: "Grilled Vegetables", priceAdjustment: 35000 },
        ],
      },
    },
  });

  const modDrinkSize = await prisma.modifierGroup.create({
    data: {
      name: "Size",
      selectionType: "single",
      modifierType: "choice", // CHOICE type
      isRequired: true,
      restaurantId: restaurant.id,
      options: {
        create: [
          { name: "Small", priceAdjustment: 0 },
          { name: "Medium", priceAdjustment: 10000 },
          { name: "Large", priceAdjustment: 20000 },
        ],
      },
    },
  });

  // 7. Create Menu Items with Photos
  console.log("🍽️  Creating Menu Items...");

  // Appetizers
  const springRolls = await prisma.menuItem.create({
    data: {
      name: "Vietnamese Spring Rolls",
      description:
        "Fresh rice paper rolls with shrimp, pork, vegetables, and vermicelli noodles. Served with peanut dipping sauce.",
      price: 65000,
      image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e",
      categoryId: catAppetizers.id,
      restaurantId: restaurant.id,
      prepTime: 10,
      isPopular: true,
      isChefRecommended: false,
      dietary: ["gluten-free"],
      nutritionalInfo: {
        calories: 180,
        protein: "12g",
        carbs: "22g",
        fat: "4g",
        fiber: "2g",
        sodium: "420mg",
        sugar: "3g",
        cholesterol: "45mg"
      },
      ingredients: ["Rice Paper", "Shrimp", "Pork", "Lettuce", "Mint", "Vermicelli Noodles", "Peanuts", "Hoisin Sauce"],
      allergens: ["Shellfish", "Peanuts", "Soy"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 145,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1559847844-5315695dadae",
            isPrimary: false,
          },
        ],
      },
    },
  });

  const friedCalamari = await prisma.menuItem.create({
    data: {
      name: "Crispy Fried Calamari",
      description:
        "Tender squid rings lightly battered and fried to golden perfection. Served with aioli sauce.",
      price: 85000,
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
      categoryId: catAppetizers.id,
      restaurantId: restaurant.id,
      prepTime: 12,
      isPopular: false,
      isChefRecommended: true,
      dietary: [],
      nutritionalInfo: {
        calories: 320,
        protein: "18g",
        carbs: "28g",
        fat: "15g",
        fiber: "1g",
        sodium: "580mg",
        sugar: "2g",
        cholesterol: "210mg"
      },
      ingredients: ["Squid", "Flour", "Eggs", "Breadcrumbs", "Garlic", "Mayonnaise", "Lemon", "Parsley"],
      allergens: ["Seafood", "Gluten", "Eggs", "Dairy"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 98,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1604909052743-94e838986d24",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7",
            isPrimary: false,
          },
        ],
      },
    },
  });

  // Soups & Salads
  const phoBeef = await prisma.menuItem.create({
    data: {
      name: "Traditional Beef Pho",
      description:
        "Aromatic beef broth with rice noodles, tender beef slices, fresh herbs, and lime.",
      price: 75000,
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
      categoryId: catSoups.id,
      restaurantId: restaurant.id,
      prepTime: 15,
      isPopular: true,
      isChefRecommended: true,
      dietary: ["dairy-free"],
      nutritionalInfo: {
        calories: 450,
        protein: "28g",
        carbs: "52g",
        fat: "12g",
        fiber: "3g",
        sodium: "1850mg",
        sugar: "5g",
        cholesterol: "65mg"
      },
      ingredients: ["Beef Bones", "Rice Noodles", "Beef Sirloin", "Star Anise", "Cinnamon", "Ginger", "Onion", "Basil", "Lime", "Bean Sprouts"],
      allergens: ["Gluten"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 234,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1555126634-323283e090fa",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modSpicy.id }],
      },
    },
  });

  const caesarSalad = await prisma.menuItem.create({
    data: {
      name: "Classic Caesar Salad",
      description:
        "Crisp romaine lettuce, parmesan cheese, croutons, and creamy Caesar dressing.",
      price: 70000,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1",
      categoryId: catSoups.id,
      restaurantId: restaurant.id,
      prepTime: 8,
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegetarian"],
      nutritionalInfo: {
        calories: 280,
        protein: "8g",
        carbs: "18g",
        fat: "20g",
        fiber: "3g",
        sodium: "690mg",
        sugar: "2g",
        cholesterol: "35mg"
      },
      ingredients: ["Romaine Lettuce", "Parmesan Cheese", "Croutons", "Anchovy", "Garlic", "Egg Yolk", "Lemon Juice", "Olive Oil"],
      allergens: ["Dairy", "Gluten", "Eggs", "Fish"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 67,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1546793665-c74683f339c1",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af",
            isPrimary: false,
          },
        ],
      },
    },
  });

  // Main Courses
  const grilledSalmon = await prisma.menuItem.create({
    data: {
      name: "Grilled Salmon Steak",
      description:
        "Premium Norwegian salmon grilled to perfection, served with lemon butter sauce, asparagus, and roasted potatoes.",
      price: 245000,
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
      categoryId: catMains.id,
      restaurantId: restaurant.id,
      prepTime: 20,
      isPopular: true,
      isChefRecommended: true,
      dietary: ["gluten-free", "dairy-free"],
      nutritionalInfo: {
        calories: 520,
        protein: "42g",
        carbs: "28g",
        fat: "26g",
        fiber: "4g",
        sodium: "680mg",
        sugar: "3g",
        cholesterol: "95mg"
      },
      ingredients: ["Norwegian Salmon", "Asparagus", "Potatoes", "Butter", "Lemon", "Garlic", "Olive Oil", "Thyme"],
      allergens: ["Fish", "Dairy"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 189,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1485921325833-c519f76c4927",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1580959375944-0b6e7796e5e2",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modSides.id }],
      },
    },
  });

  const beefSteak = await prisma.menuItem.create({
    data: {
      name: "Premium Wagyu Beef Steak",
      description:
        "Australian Wagyu beef (250g) cooked to your preference. Served with black pepper sauce.",
      price: 450000,
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
      categoryId: catMains.id,
      restaurantId: restaurant.id,
      prepTime: 25,
      isPopular: true,
      isChefRecommended: true,
      dietary: ["gluten-free", "dairy-free"],
      nutritionalInfo: {
        calories: 680,
        protein: "52g",
        carbs: "8g",
        fat: "48g",
        fiber: "1g",
        sodium: "920mg",
        sugar: "2g",
        cholesterol: "165mg"
      },
      ingredients: ["Wagyu Beef", "Black Pepper", "Butter", "Garlic", "Rosemary", "Red Wine", "Beef Stock"],
      allergens: ["Dairy"],
      isAvailable: true,
      stockStatus: "low_stock",
      orderCount: 156,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1558030006-450675393462",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1544025162-d76694265947",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modSides.id }],
      },
    },
  });

  const chickenCurry = await prisma.menuItem.create({
    data: {
      name: "Thai Green Curry Chicken",
      description:
        "Tender chicken in aromatic green curry with coconut milk, bamboo shoots, and Thai basil. Served with jasmine rice.",
      price: 125000,
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd",
      categoryId: catMains.id,
      restaurantId: restaurant.id,
      prepTime: 18,
      isPopular: false,
      isChefRecommended: false,
      dietary: ["gluten-free", "dairy-free"],
      nutritionalInfo: {
        calories: 580,
        protein: "35g",
        carbs: "62g",
        fat: "18g",
        fiber: "5g",
        sodium: "1240mg",
        sugar: "8g",
        cholesterol: "85mg"
      },
      ingredients: ["Chicken Breast", "Coconut Milk", "Green Curry Paste", "Bamboo Shoots", "Thai Basil", "Jasmine Rice", "Fish Sauce", "Palm Sugar"],
      allergens: ["Fish"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 92,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1574484284002-952d92456975",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modSpicy.id }],
      },
    },
  });

  const veganBowl = await prisma.menuItem.create({
    data: {
      name: "Mediterranean Vegan Bowl",
      description:
        "Quinoa, roasted vegetables, chickpeas, hummus, tahini dressing, and fresh herbs.",
      price: 95000,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      categoryId: catMains.id,
      restaurantId: restaurant.id,
      prepTime: 12,
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
      nutritionalInfo: {
        calories: 420,
        protein: "16g",
        carbs: "58g",
        fat: "14g",
        fiber: "12g",
        sodium: "540mg",
        sugar: "9g",
        cholesterol: "0mg"
      },
      ingredients: ["Quinoa", "Chickpeas", "Zucchini", "Bell Peppers", "Eggplant", "Tahini", "Lemon", "Garlic", "Parsley"],
      allergens: ["Sesame"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 54,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
            isPrimary: false,
          },
        ],
      },
    },
  });

  // Seafood
  const garlicShrimp = await prisma.menuItem.create({
    data: {
      name: "Garlic Butter Shrimp",
      description:
        "Jumbo shrimp sautéed in garlic butter with white wine and parsley. Served with crusty bread.",
      price: 185000,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      categoryId: catSeafood.id,
      restaurantId: restaurant.id,
      prepTime: 15,
      isPopular: true,
      isChefRecommended: false,
      dietary: ["gluten-free"],
      nutritionalInfo: {
        calories: 380,
        protein: "32g",
        carbs: "24g",
        fat: "18g",
        fiber: "2g",
        sodium: "890mg",
        sugar: "2g",
        cholesterol: "285mg"
      },
      ingredients: ["Jumbo Shrimp", "Butter", "Garlic", "White Wine", "Parsley", "Lemon", "Crusty Bread"],
      allergens: ["Shellfish", "Dairy", "Gluten"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 123,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62",
            isPrimary: false,
          },
        ],
      },
    },
  });

  const lobsterThermidor = await prisma.menuItem.create({
    data: {
      name: "Lobster Thermidor",
      description:
        "Whole lobster in creamy brandy sauce with mushrooms and cheese, gratinated to perfection.",
      price: 650000,
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523f",
      categoryId: catSeafood.id,
      restaurantId: restaurant.id,
      prepTime: 30,
      isPopular: false,
      isChefRecommended: true,
      dietary: [],
      nutritionalInfo: {
        calories: 720,
        protein: "48g",
        carbs: "12g",
        fat: "52g",
        fiber: "1g",
        sodium: "1580mg",
        sugar: "3g",
        cholesterol: "320mg"
      },
      ingredients: ["Whole Lobster", "Heavy Cream", "Brandy", "Mushrooms", "Gruyere Cheese", "Butter", "Shallots", "Mustard"],
      allergens: ["Shellfish", "Dairy", "Alcohol"],
      isAvailable: false,
      stockStatus: "available",
      orderCount: 23,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1559737558-2f5a35f4523f",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1625938145312-c272827e7a6c",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab",
            isPrimary: false,
          },
        ],
      },
    },
  });

  // Beverages
  const vietnameseCoffee = await prisma.menuItem.create({
    data: {
      name: "Vietnamese Iced Coffee",
      description:
        "Strong Vietnamese coffee with condensed milk served over ice.",
      price: 45000,
      image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
      categoryId: catDrinks.id,
      restaurantId: restaurant.id,
      prepTime: 5,
      isPopular: true,
      isChefRecommended: false,
      dietary: ["vegetarian", "gluten-free"],
      nutritionalInfo: {
        calories: 150,
        protein: "3g",
        carbs: "24g",
        fat: "4g",
        fiber: "0g",
        sodium: "45mg",
        sugar: "22g",
        cholesterol: "15mg"
      },
      ingredients: ["Vietnamese Coffee", "Condensed Milk", "Ice"],
      allergens: ["Dairy"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 312,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modDrinkSize.id }],
      },
    },
  });

  const mangoSmoothie = await prisma.menuItem.create({
    data: {
      name: "Fresh Mango Smoothie",
      description: "Blended fresh mango with yogurt and honey.",
      price: 55000,
      image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625",
      categoryId: catDrinks.id,
      restaurantId: restaurant.id,
      prepTime: 5,
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegetarian", "gluten-free"],
      nutritionalInfo: {
        calories: 220,
        protein: "6g",
        carbs: "48g",
        fat: "2g",
        fiber: "3g",
        sodium: "75mg",
        sugar: "42g",
        cholesterol: "8mg"
      },
      ingredients: ["Fresh Mango", "Greek Yogurt", "Honey", "Ice", "Milk"],
      allergens: ["Dairy"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 87,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1546173159-315724a31696",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            isPrimary: false,
          },
        ],
      },
      modifierGroups: {
        create: [{ modifierGroupId: modDrinkSize.id }],
      },
    },
  });

  // Desserts
  const tiramisu = await prisma.menuItem.create({
    data: {
      name: "Classic Italian Tiramisu",
      description:
        "Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa powder.",
      price: 85000,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
      categoryId: catDesserts.id,
      restaurantId: restaurant.id,
      prepTime: 8,
      isPopular: true,
      isChefRecommended: true,
      dietary: ["vegetarian"],
      nutritionalInfo: {
        calories: 380,
        protein: "7g",
        carbs: "42g",
        fat: "20g",
        fiber: "1g",
        sodium: "180mg",
        sugar: "28g",
        cholesterol: "125mg"
      },
      ingredients: ["Ladyfingers", "Mascarpone Cheese", "Espresso", "Eggs", "Sugar", "Cocoa Powder", "Marsala Wine"],
      allergens: ["Gluten", "Dairy", "Eggs", "Alcohol"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 167,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1586040140378-b5d0b9cfb29a",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1481391243133-f96216dcb5d2",
            isPrimary: false,
          },
        ],
      },
    },
  });

  const cremeBrulee = await prisma.menuItem.create({
    data: {
      name: "Vanilla Crème Brûlée",
      description: "Silky vanilla custard with caramelized sugar crust.",
      price: 75000,
      image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc",
      categoryId: catDesserts.id,
      restaurantId: restaurant.id,
      prepTime: 10,
      isPopular: false,
      isChefRecommended: true,
      dietary: ["vegetarian", "gluten-free"],
      nutritionalInfo: {
        calories: 340,
        protein: "5g",
        carbs: "32g",
        fat: "22g",
        fiber: "0g",
        sodium: "120mg",
        sugar: "28g",
        cholesterol: "280mg"
      },
      ingredients: ["Heavy Cream", "Egg Yolks", "Sugar", "Vanilla Bean", "Salt"],
      allergens: ["Dairy", "Eggs"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 98,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1551024506-0bccd828d307",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1587314168485-3236d6710814",
            isPrimary: false,
          },
        ],
      },
    },
  });

  const chocolateLava = await prisma.menuItem.create({
    data: {
      name: "Molten Chocolate Lava Cake",
      description:
        "Warm chocolate cake with liquid chocolate center. Served with vanilla ice cream.",
      price: 95000,
      image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51",
      categoryId: catDesserts.id,
      restaurantId: restaurant.id,
      prepTime: 12,
      isPopular: true,
      isChefRecommended: false,
      dietary: ["vegetarian"],
      nutritionalInfo: {
        calories: 480,
        protein: "8g",
        carbs: "58g",
        fat: "26g",
        fiber: "3g",
        sodium: "240mg",
        sugar: "42g",
        cholesterol: "165mg"
      },
      ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla Ice Cream"],
      allergens: ["Gluten", "Dairy", "Eggs"],
      isAvailable: true,
      stockStatus: "available",
      orderCount: 201,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1606312619070-d48b4ceb6bf0",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
            isPrimary: false,
          },
          {
            url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
            isPrimary: false,
          },
        ],
      },
    },
  });

  // 8. Create Reviews
  console.log("⭐ Creating Reviews...");

  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "The Wagyu beef steak was absolutely amazing! Perfectly cooked and melts in your mouth. Highly recommend!",
      userId: customer1.id,
      menuItemId: beefSteak.id,
      restaurantId: restaurant.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "Best pho I've had in the city! The broth is so flavorful and authentic.",
      userId: customer2.id,
      menuItemId: phoBeef.id,
      restaurantId: restaurant.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment:
        "Grilled salmon was delicious, though a bit pricey. Worth it for special occasions!",
      userId: customer1.id,
      menuItemId: grilledSalmon.id,
      restaurantId: restaurant.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "The tiramisu is to die for! Perfect ending to a great meal.",
      userId: customer2.id,
      menuItemId: tiramisu.id,
      restaurantId: restaurant.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Vietnamese coffee is authentic and strong. Love it!",
      userId: customer1.id,
      menuItemId: vietnameseCoffee.id,
      restaurantId: restaurant.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 3,
      comment:
        "Spring rolls were good but could use more flavor in the dipping sauce.",
      userId: customer2.id,
      menuItemId: springRolls.id,
      restaurantId: restaurant.id,
    },
  });

    // 9. Create Sample Orders
    console.log('📦 Creating Sample Orders...');
    // Create diverse orders matching kitchen dashboard requirements
    const sampleOrders = [
        {
            orderNumber: 'ORD-001',
            status: 'RECEIVED',
            tableId: tables[0].id, // Table 1
            restaurantId: restaurant.id,
            customerId: customer1.id,
            customerName: customer1.fullName,
            customerPhone: customer1.phone,
            submittedAt: new Date(Date.now() - 5 * 60000), // 5 min ago
            acceptedById: waiter.id,
            orderItems: {
                create: [
                    {
                        menuItemId: springRolls.id,
                        quantity: 1,
                        unitPrice: 65000,
                        modifiers: ['Extra Cheese', 'Thin Crust'],
                        specialInstructions: '',
                        itemStatus: 'queued'
                    },
                    {
                        menuItemId: friedCalamari.id,
                        quantity: 2,
                        unitPrice: 85000,
                        modifiers: ['Spicy', 'Ranch Dressing'],
                        specialInstructions: '',
                        itemStatus: 'queued'
                    }
                ]
            }
        },
        {
            orderNumber: 'ORD-002',
            status: 'PREPARING',
            tableId: tables[11].id, // Table 12
            restaurantId: restaurant.id,
            customerId: customer2.id,
            customerName: customer2.fullName,
            customerPhone: customer2.phone,
            submittedAt: new Date(Date.now() - 15 * 60000),
            acceptedAt: new Date(Date.now() - 14 * 60000),
            preparingAt: new Date(Date.now() - 13 * 60000),
            acceptedById: waiter.id,
            orderItems: {
                create: [
                    {
                        menuItemId: springRolls.id,
                        quantity: 1,
                        unitPrice: 65000,
                        modifiers: ['Extra Cheese', 'Thin Crust'],
                        specialInstructions: '',
                        itemStatus: 'cooking'
                    },
                    {
                        menuItemId: friedCalamari.id,
                        quantity: 3,
                        unitPrice: 85000,
                        modifiers: ['Spicy', 'Ranch Dressing'],
                        specialInstructions: '',
                        itemStatus: 'ready'
                    }
                ]
            }
        },
        {
            orderNumber: 'ORD-003',
            status: 'RECEIVED',
            tableId: tables[1].id, // Table 2
            restaurantId: restaurant.id,
            customerId: customer1.id,
            customerName: customer1.fullName,
            customerPhone: customer1.phone,
            submittedAt: new Date(Date.now() - 2 * 60000),
            acceptedById: waiter.id,
            orderItems: {
                create: [
                    {
                        menuItemId: beefSteak.id,
                        quantity: 1,
                        unitPrice: 450000,
                        modifiers: ['Medium Rare'],
                        specialInstructions: 'No onions',
                        itemStatus: 'queued'
                    },
                    {
                        menuItemId: vietnameseCoffee.id,
                        quantity: 2,
                        unitPrice: 45000,
                        modifiers: ['Large Size'],
                        specialInstructions: '',
                        itemStatus: 'queued'
                    }
                ]
            }
        },
        {
            orderNumber: 'ORD-004',
            status: 'READY',
            tableId: tables[2].id, // Table 3
            restaurantId: restaurant.id,
            customerId: customer2.id,
            customerName: customer2.fullName,
            customerPhone: customer2.phone,
            submittedAt: new Date(Date.now() - 25 * 60000),
            acceptedAt: new Date(Date.now() - 24 * 60000),
            preparingAt: new Date(Date.now() - 20 * 60000),
            readyAt: new Date(Date.now() - 5 * 60000),
            acceptedById: waiter.id,
            orderItems: {
                create: [
                    {
                        menuItemId: chickenCurry.id,
                        quantity: 1,
                        unitPrice: 125000,
                        modifiers: ['Extra Spicy'],
                        specialInstructions: '',
                        itemStatus: 'ready'
                    },
                    {
                        menuItemId: springRolls.id,
                        quantity: 4,
                        unitPrice: 65000,
                        modifiers: ['Vegetarian'],
                        specialInstructions: '',
                        itemStatus: 'ready'
                    }
                ]
            }
        },
        {
            orderNumber: 'ORD-005',
            status: 'SUBMITTED',
            tableId: tables[14].id, // Table 15
            restaurantId: restaurant.id,
            customerId: customer1.id,
            customerName: customer1.fullName,
            customerPhone: customer1.phone,
            submittedAt: new Date(),
            orderItems: {
                create: [
                    {
                        menuItemId: beefSteak.id,
                        quantity: 1,
                        unitPrice: 450000,
                        modifiers: ['Medium'],
                        specialInstructions: 'Customer prefers thicker cut',
                        itemStatus: 'queued'
                    }
                ]
            }
        },
        {
            orderNumber: 'ORD-006',
            status: 'READY',
            tableId: tables[6].id, // Table 7
            restaurantId: restaurant.id,
            customerId: customer2.id,
            customerName: customer2.fullName,
            customerPhone: customer2.phone,
            submittedAt: new Date(Date.now() - 12 * 60000),
            acceptedAt: new Date(Date.now() - 11 * 60000),
            preparingAt: new Date(Date.now() - 10 * 60000),
            readyAt: new Date(Date.now() - 2 * 60000),
            acceptedById: waiter.id,
            orderItems: {
                create: [
                    {
                        menuItemId: phoBeef.id,
                        quantity: 2,
                        unitPrice: 75000,
                        modifiers: ['Extra Croutons'],
                        specialInstructions: '',
                        itemStatus: 'ready'
                    }
                ]
            }
        }
    ];
    const createdOrders = [];
    for (const order of sampleOrders) {
        const createdOrder = await prisma.order.create({
            data: order,
            include: {
                orderItems: true
            }
        });
        createdOrders.push(createdOrder);
    }

    // Create Bills for completed orders to enable analytics
    console.log('💵 Creating Bills for orders...');
    for (const order of createdOrders) {
        // Calculate bill details
        let subtotal = 0;
        for (const item of order.orderItems) {
            subtotal += Number(item.unitPrice) * item.quantity;
        }
        const discount = Number(order.discount) || 0;
        const taxRate = 0.1;
        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        const tax = subtotalAfterDiscount * taxRate;
        const total = subtotalAfterDiscount + tax;

        await prisma.bill.create({
            data: {
                orderId: order.id,
                restaurantId: order.restaurantId,
                billNumber: order.orderNumber.replace('ORD', 'BILL'),
                subtotal,
                discount,
                tax,
                total,
                createdBy: waiter.id,
                createdAt: order.submittedAt || new Date()
            }
        });
    }

  // --- Create Bulk Reviews ---
  console.log("Seeding reviews...");
  const allMenuItems = await prisma.menuItem.findMany();
  const allUsers = await prisma.user.findMany();

  const reviewComments = [
    {
      rating: 5,
      comment: "Absolutely delicious! The flavors were perfectly balanced.",
    },
    {
      rating: 4,
      comment: "Great taste, but the portion was a bit small for the price.",
    },
    { rating: 5, comment: "Best I've ever had! Highly recommended." },
    {
      rating: 3,
      comment: "It was okay, not as good as I expected based on the photos.",
    },
    {
      rating: 5,
      comment: "Fresh ingredients and amazing presentation. Will order again!",
    },
    { rating: 4, comment: "Tasty and well-cooked. Service was quick too." },
    { rating: 2, comment: "Too salty for my taste. Disappointed." },
    {
      rating: 5,
      comment: "A masterpiece! The chef really knows what they are doing.",
    },
    { rating: 4, comment: "Good value for money. Solid choice." },
    {
      rating: 1,
      comment: "Food arrived cold and looked nothing like the picture.",
    },
  ];

  if (allUsers.length > 0 && allMenuItems.length > 0) {
    for (const item of allMenuItems) {
      // Create 3-7 random reviews for each item
      const numberOfReviews = Math.floor(Math.random() * 5) + 3;

      for (let i = 0; i < numberOfReviews; i++) {
        const randomReview =
          reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const randomUser =
          allUsers[Math.floor(Math.random() * allUsers.length)];

        // Random date within last 30 days
        const randomDate = new Date();
        randomDate.setDate(
          randomDate.getDate() - Math.floor(Math.random() * 30)
        );

        await prisma.review.create({
          data: {
            rating: randomReview.rating,
            comment: randomReview.comment,
            menuItemId: item.id,
            userId: randomUser.id,
            restaurantId: item.restaurantId,
            createdAt: randomDate,
          },
        });
      }
    }
    console.log("Reviews seeded successfully.");
  }

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log("   - Restaurant: Café Poirot");
  console.log(
    "   - Users: 6 (1 admin, 1 waiter, 1 chef, 2 customers, 1 super admin)"
  );
  console.log("   - Tables: 15");
  console.log("   - Categories: 6");
  console.log("   - Menu Items: 16 (with photos, dietary info, reviews)");
  console.log("   - Modifier Groups: 3");
  console.log("   - Reviews: 6");
  console.log("   - Sample Orders: 1");
  console.log("");
  console.log("🔑 Login credentials (password for all: password123):");
  console.log("   - Admin: admin@cafepoirot.com");
  console.log("   - Waiter: waiter@cafepoirot.com");
  console.log("   - Chef: chef@cafepoirot.com");
  console.log("   - Customer 1: customer1@gmail.com");
  console.log("   - Customer 2: customer2@gmail.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
