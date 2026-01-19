const { prisma } = require("../config/database");

class ReviewService {
    /**
     * Add a new review
     * @param {Object} data Review data
     * @returns {Promise<Object>} Created review
     */
    async createReview(data) {
        const { userId, menuItemId, restaurantId, rating, comment } = data;

        // Check if item exists
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
        });
        if (!menuItem) throw new Error("Menu item not found");

        // Check if user has ordered this item and it has been served
        // For multi-batch orders, we need to check the specific item status, not just the order status
        const existingOrder = await prisma.order.findFirst({
            where: {
                customerId: userId,
                // Order must not be cancelled or rejected entirely
                status: {
                    notIn: ["CANCELLED", "REJECTED", "DRAFT", "SUBMITTED"]
                },
                orderItems: {
                    some: {
                        menuItemId: menuItemId,
                        // The specific item MUST be served or completed
                        itemStatus: {
                            in: ["served", "completed"]
                        }
                    }
                }
            }
        });

        if (!existingOrder) {
            throw new Error("You can only review items that you have ordered and have been served.");
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                menuItemId,
                restaurantId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: { fullName: true }
                }
            }
        });

        return review;
    }

    /**
     * Get reviews for a menu item
     * @param {String} menuItemId 
     * @param {Object} options Pagination options
     */
    async getReviews(menuItemId, options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { menuItemId },
                include: {
                    user: {
                        select: { id: true, fullName: true, avatar: true, role: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.review.count({ where: { menuItemId } }),
        ]);

        return {
            reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

module.exports = new ReviewService();
