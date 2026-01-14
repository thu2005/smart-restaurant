const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CartService {
    /**
     * Get or create a cart for a table session
     */
    async getOrCreateCart(tableId, restaurantId, sessionId = null, customerId = null) {
        // Try to find existing cart
        let cart = await prisma.cart.findFirst({
            where: {
                tableId,
                restaurantId,
                ...(sessionId && { sessionId }),
                ...(customerId && { customerId })
            },
            include: {
                cartItems: {
                    include: {
                        menuItem: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                table: true
            }
        });

        // Create new cart if not found
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    tableId,
                    restaurantId,
                    sessionId,
                    customerId,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                },
                include: {
                    cartItems: {
                        include: {
                            menuItem: {
                                include: {
                                    category: true
                                }
                            }
                        }
                    },
                    table: true
                }
            });
        }

        return cart;
    }

    /**
     * Add item to cart
     */
    async addItemToCart(cartId, menuItemId, quantity = 1, modifiers = [], specialInstructions = null) {
        // Verify menu item exists and is available
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId }
        });

        if (!menuItem) {
            throw new Error('Menu item not found');
        }

        if (!menuItem.isAvailable) {
            throw new Error('Menu item is not available');
        }

        // Check if item with same modifiers already exists
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId,
                menuItemId,
                modifiers: {
                    equals: modifiers
                },
                specialInstructions
            }
        });

        let cartItem;
        if (existingItem) {
            // Update quantity if item exists
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity
                },
                include: {
                    menuItem: true
                }
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId,
                    menuItemId,
                    quantity,
                    modifiers,
                    specialInstructions
                },
                include: {
                    menuItem: true
                }
            });
        }

        // Update cart timestamp
        await prisma.cart.update({
            where: { id: cartId },
            data: { updatedAt: new Date() }
        });

        return cartItem;
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(cartItemId, quantity) {
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const cartItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: {
                menuItem: true
            }
        });

        // Update cart timestamp
        await prisma.cart.update({
            where: { id: cartItem.cartId },
            data: { updatedAt: new Date() }
        });

        return cartItem;
    }

    /**
     * Remove item from cart
     */
    async removeCartItem(cartItemId) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId }
        });

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        await prisma.cartItem.delete({
            where: { id: cartItemId }
        });

        // Update cart timestamp
        await prisma.cart.update({
            where: { id: cartItem.cartId },
            data: { updatedAt: new Date() }
        });

        return { success: true, message: 'Item removed from cart' };
    }

    /**
     * Get cart with all items
     */
    async getCart(cartId) {
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                cartItems: {
                    include: {
                        menuItem: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                table: true,
                customer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Calculate totals
        let subtotal = 0;
        cart.cartItems.forEach(item => {
            const itemPrice = Number(item.menuItem.price) * item.quantity;
            subtotal += itemPrice;
        });

        return {
            ...cart,
            subtotal,
            itemCount: cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    /**
     * Get cart by table and session
     */
    async getCartByTableSession(tableId, sessionId = null, restaurantId) {
        const cart = await prisma.cart.findFirst({
            where: {
                tableId,
                restaurantId,
                ...(sessionId && { sessionId })
            },
            include: {
                cartItems: {
                    include: {
                        menuItem: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                table: true
            }
        });

        if (!cart) {
            return null;
        }

        // Calculate totals
        let subtotal = 0;
        cart.cartItems.forEach(item => {
            const itemPrice = Number(item.menuItem.price) * item.quantity;
            subtotal += itemPrice;
        });

        return {
            ...cart,
            subtotal,
            itemCount: cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    /**
     * Clear cart (remove all items)
     */
    async clearCart(cartId) {
        await prisma.cartItem.deleteMany({
            where: { cartId }
        });

        await prisma.cart.update({
            where: { id: cartId },
            data: { updatedAt: new Date() }
        });

        return { success: true, message: 'Cart cleared' };
    }

    /**
     * Convert cart to order
     */
    async convertCartToOrder(cartId, orderData = {}) {
        const cart = await this.getCart(cartId);

        if (!cart.cartItems || cart.cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Prepare order items
        const orderItems = cart.cartItems.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.menuItem.price,
            modifiers: item.modifiers,
            specialInstructions: item.specialInstructions
        }));

        // Calculate order number
        const count = await prisma.order.count({ 
            where: { restaurantId: cart.restaurantId } 
        });
        const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                restaurantId: cart.restaurantId,
                tableId: cart.tableId,
                customerId: cart.customerId,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                specialInstructions: orderData.specialInstructions,
                status: 'SUBMITTED',
                submittedAt: new Date(),
                orderItems: {
                    create: orderItems
                }
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                },
                table: true,
                customer: true
            }
        });

        // Clear cart after order creation
        await this.clearCart(cartId);

        return order;
    }

    /**
     * Delete expired carts
     */
    async deleteExpiredCarts() {
        const result = await prisma.cart.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        return result;
    }
}

module.exports = new CartService();
