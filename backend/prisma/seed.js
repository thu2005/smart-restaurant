const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Clean up database 
    console.log('Clearing old data...');
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
    console.log('Creating Restaurant...');
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Café Poirot',
            description: 'Fine dining experience with modern twist',
            address: '123 Culinary Ave, Food City',
            phone: '+84 123 456 789',
            email: 'contact@cafepoirot.com',
            timezone: 'Asia/Ho_Chi_Minh',
            currency: 'VND',
            openingHours: {
                monday: { open: '08:00', close: '21:00' },
                tuesday: { open: '08:00', close: '21:00' },
                wednesday: { open: '08:00', close: '21:00' },
                thursday: { open: '08:00', close: '21:00' },
                friday: { open: '08:00', close: '23:00' },
                saturday: { open: '09:00', close: '23:00' },
                sunday: { open: '09:00', close: '21:00' }
            }
        }
    });

    // 3. Create Users
    console.log('Creating Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Super Admin (System Level)
    await prisma.user.create({
        data: {
            email: 'superadmin@system.com',
            password: hashedPassword,
            fullName: 'System Super Admin',
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
            fullName: 'Restaurant Owner',
            role: 'ADMIN',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true
        }
    });

    // Waiter
    const waiter = await prisma.user.create({
        data: {
            email: 'waiter@cafepoirot.com',
            password: hashedPassword,
            fullName: 'John Waiter',
            role: 'WAITER',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true
        }
    });

    // Kitchen Staff
    const kitchen = await prisma.user.create({
        data: {
            email: 'chef@cafepoirot.com',
            password: hashedPassword,
            fullName: 'Gordon Chef',
            role: 'KITCHEN',
            restaurantId: restaurant.id,
            isActive: true,
            emailVerified: true
        }
    });

    // Customer
    const customer = await prisma.user.create({
        data: {
            email: 'customer@gmail.com',
            password: hashedPassword,
            fullName: 'Alice Customer',
            role: 'CUSTOMER',
            restaurantId: null,
            isActive: true,
            emailVerified: true
        }
    });

    // 4. Create Tables
    console.log('Creating Tables...');
    const tables = [];
    for (let i = 1; i <= 10; i++) {
        tables.push(await prisma.table.create({
            data: {
                tableNumber: `T${i}`,
                capacity: i % 2 === 0 ? 4 : 2,
                location: i <= 5 ? 'Ground Floor' : 'Terrace',
                restaurantId: restaurant.id,
                qrCode: `QR_T${i}_${Date.now()}`
            }
        }));
    }

    // 5. Create Categories
    console.log('Creating Categories...');
    const catStarters = await prisma.category.create({
        data: { name: 'Starters', displayOrder: 1, restaurantId: restaurant.id }
    });
    const catMains = await prisma.category.create({
        data: { name: 'Main Courses', displayOrder: 2, restaurantId: restaurant.id }
    });
    const catDrinks = await prisma.category.create({
        data: { name: 'Drinks', displayOrder: 3, restaurantId: restaurant.id }
    });
    const catDesserts = await prisma.category.create({
        data: { name: 'Desserts', displayOrder: 4, restaurantId: restaurant.id }
    });

    // 6. Create Modifier Groups
    console.log('Creating Modifiers...');

    // Spiciness
    const modSpicy = await prisma.modifierGroup.create({
        data: {
            name: 'Spiciness Level',
            selectionType: 'single',
            isRequired: true,
            restaurantId: restaurant.id,
            options: {
                create: [
                    { name: 'Mild', priceAdjustment: 0 },
                    { name: 'Medium', priceAdjustment: 0 },
                    { name: 'Hot', priceAdjustment: 0 },
                    { name: 'Extra Hot', priceAdjustment: 0.5 }
                ]
            }
        }
    });

    // Sides
    const modSides = await prisma.modifierGroup.create({
        data: {
            name: 'Sides',
            selectionType: 'multiple',
            isRequired: false,
            maxSelections: 2,
            restaurantId: restaurant.id,
            options: {
                create: [
                    { name: 'French Fries', priceAdjustment: 2.5 },
                    { name: 'Salad', priceAdjustment: 3.0 },
                    { name: 'Mashed Potato', priceAdjustment: 2.5 }
                ]
            }
        }
    });

    // 7. Create Menu Items
    console.log('Creating Menu Items...');

    // Starter: Spring Rolls
    await prisma.menuItem.create({
        data: {
            name: 'Spring Rolls',
            description: 'Crispy vegetable spring rolls served with dipping sauce.',
            price: 5.99,
            categoryId: catStarters.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/spring-rolls.jpg',
            isAvailable: true,
            isPopular: true
        }
    });

    // Main: Spicy Chicken Burger
    const burger = await prisma.menuItem.create({
        data: {
            name: 'Spicy Chicken Burger',
            description: 'Grilled chicken breast with spicy sauce and lettuce.',
            price: 12.99,
            categoryId: catMains.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/burger.jpg',
            prepTime: 15,
            isChefRecommended: true,
            modifierGroups: {
                create: [
                    { modifierGroupId: modSpicy.id },
                    { modifierGroupId: modSides.id }
                ]
            }
        }
    });

    // Main: Steak
    await prisma.menuItem.create({
        data: {
            name: 'Premium Steak',
            description: '200g Ribeye steak cooked to perfection.',
            price: 24.99,
            categoryId: catMains.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/steak.jpg',
            prepTime: 20
        }
    });

    // Main: Truffle Pasta
    await prisma.menuItem.create({
        data: {
            name: 'Truffle Mushroom Pasta',
            description: 'Creamy tagliatelle with wild mushrooms and black truffle oil.',
            price: 18.50,
            categoryId: catMains.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/pasta.jpg',
            prepTime: 18
        }
    });

    // Main: Caesar Salad
    await prisma.menuItem.create({
        data: {
            name: 'Classic Caesar Salad',
            description: 'Romaine lettuce, croutons, parmesan cheese, and caesar dressing.',
            price: 10.99,
            categoryId: catMains.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/salad.jpg',
            dietary: ['Vegetarian']
        }
    });

    // Drink: Lemonade
    await prisma.menuItem.create({
        data: {
            name: 'Fresh Lemonade',
            description: 'Freshly squeezed lemons with mint.',
            price: 3.50,
            categoryId: catDrinks.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/lemonade.jpg'
        }
    });

    // Dessert: Tiramisu
    await prisma.menuItem.create({
        data: {
            name: 'Classic Tiramisu',
            description: 'Espresso-soaked ladyfingers with mascarpone cream.',
            price: 7.99,
            categoryId: catDesserts.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/tiramisu.jpg',
            isPopular: true
        }
    });

    // Dessert: Cheesecake
    await prisma.menuItem.create({
        data: {
            name: 'New York Cheesecake',
            description: 'Rich and creamy cheesecake with berry compote.',
            price: 8.50,
            categoryId: catDesserts.id,
            restaurantId: restaurant.id,
            image: '/uploads/seed/cheesecake.jpg'
        }
    });

    // 8. Create Orders
    console.log('Creating Sample Orders...');

    // Order 1: Pending order on Table 1 (SUBMITTED)
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-001',
            status: 'SUBMITTED',
            tableId: tables[0].id,
            restaurantId: restaurant.id,
            customerName: 'Guest John',
            submittedAt: new Date(),
            orderItems: {
                create: [
                    {
                        menuItemId: burger.id,
                        quantity: 2,
                        unitPrice: 12.99,
                        modifiers: ['Medium', 'French Fries'],
                        specialInstructions: 'No onions please'
                    }
                ]
            }
        }
    });

    // Order 2: Ready to serve on Table 2 (READY) - accepted by waiter
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-002',
            status: 'READY',
            tableId: tables[1].id,
            restaurantId: restaurant.id,
            customerName: 'Alice Smith',
            acceptedById: waiter.id,
            submittedAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
            acceptedAt: new Date(Date.now() - 28 * 60000),
            preparingAt: new Date(Date.now() - 25 * 60000),
            readyAt: new Date(Date.now() - 5 * 60000),
            orderItems: {
                create: [
                    {
                        menuItemId: burger.id,
                        quantity: 1,
                        unitPrice: 12.99,
                        modifiers: ['Hot', 'Salad'],
                        specialInstructions: 'Extra crispy'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Spring Rolls' } })).id,
                        quantity: 1,
                        unitPrice: 5.99,
                        modifiers: [],
                        specialInstructions: null
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Fresh Lemonade' } })).id,
                        quantity: 2,
                        unitPrice: 3.50,
                        modifiers: [],
                        specialInstructions: 'Extra ice'
                    }
                ]
            }
        }
    });

    // Order 3: In kitchen on Table 3 (PREPARING) - accepted by waiter
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-003',
            status: 'PREPARING',
            tableId: tables[2].id,
            restaurantId: restaurant.id,
            customerName: 'Bob Johnson',
            acceptedById: waiter.id,
            submittedAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
            acceptedAt: new Date(Date.now() - 14 * 60000),
            preparingAt: new Date(Date.now() - 12 * 60000),
            orderItems: {
                create: [
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Premium Steak' } })).id,
                        quantity: 1,
                        unitPrice: 24.99,
                        modifiers: [],
                        specialInstructions: 'Medium rare'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Truffle Mushroom Pasta' } })).id,
                        quantity: 1,
                        unitPrice: 18.50,
                        modifiers: [],
                        specialInstructions: 'No garlic'
                    }
                ]
            }
        }
    });

    // Order 4: Another ready order on Table 4 (READY) - accepted by waiter
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-004',
            status: 'READY',
            tableId: tables[3].id,
            restaurantId: restaurant.id,
            customerName: 'Carol White',
            acceptedById: waiter.id,
            submittedAt: new Date(Date.now() - 25 * 60000),
            acceptedAt: new Date(Date.now() - 23 * 60000),
            preparingAt: new Date(Date.now() - 20 * 60000),
            readyAt: new Date(Date.now() - 3 * 60000),
            orderItems: {
                create: [
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Classic Caesar Salad' } })).id,
                        quantity: 2,
                        unitPrice: 10.99,
                        modifiers: [],
                        specialInstructions: 'Dressing on the side'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Classic Tiramisu' } })).id,
                        quantity: 1,
                        unitPrice: 7.99,
                        modifiers: [],
                        specialInstructions: null
                    }
                ]
            }
        }
    });

    // Order 5: Pending multi-item order on Table 5 (SUBMITTED)
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-005',
            status: 'SUBMITTED',
            tableId: tables[4].id,
            restaurantId: restaurant.id,
            customerName: 'David Brown',
            submittedAt: new Date(),
            orderItems: {
                create: [
                    {
                        menuItemId: burger.id,
                        quantity: 3,
                        unitPrice: 12.99,
                        modifiers: ['Extra Hot', 'French Fries', 'Mashed Potato'],
                        specialInstructions: 'Make it spicy!'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Spring Rolls' } })).id,
                        quantity: 2,
                        unitPrice: 5.99,
                        modifiers: [],
                        specialInstructions: 'Vegetarian only'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'Fresh Lemonade' } })).id,
                        quantity: 3,
                        unitPrice: 3.50,
                        modifiers: [],
                        specialInstructions: 'No sugar'
                    },
                    {
                        menuItemId: (await prisma.menuItem.findFirst({ where: { name: 'New York Cheesecake' } })).id,
                        quantity: 1,
                        unitPrice: 8.50,
                        modifiers: [],
                        specialInstructions: null
                    }
                ]
            }
        }
    });

    console.log('Seed completed successfully!');
    console.log(`   Logged in users: 
   - Admin: admin@cafepoirot.com / password123
   - Waiter: waiter@cafepoirot.com / password123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
