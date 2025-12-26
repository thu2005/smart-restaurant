const { prisma } = require('../config/database');

class MenuService {
    // --- Categories ---
    async getCategories(restaurantId) {
        return await prisma.category.findMany({
            where: { restaurantId, isActive: true },
            include: {
                menuItems: {
                    where: { isAvailable: true }, // Optional: only available items
                },
            },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async createCategory(data) {
        return await prisma.category.create({
            data,
        });
    }

    // --- Menu Items ---
    async getMenuItems(restaurantId, categoryId = null) {
        const where = { restaurantId };
        if (categoryId) where.categoryId = categoryId;

        return await prisma.menuItem.findMany({
            where,
            include: { category: true },
        });
    }

    async getMenuItemById(id) {
        const item = await prisma.menuItem.findUnique({
            where: { id },
            include: { category: true }
        });
        if (!item) throw new Error('Menu item not found');
        return item;
    }

    async createMenuItem(data) {
        // Check if category belongs to restaurant
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId }
        });

        if (!category || category.restaurantId !== data.restaurantId) {
            throw new Error('Invalid category for this restaurant');
        }

        return await prisma.menuItem.create({
            data,
        });
    }

    async updateMenuItem(id, data) {
        await this.getMenuItemById(id);
        const {
            id: _id,
            createdAt,
            updatedAt,
            categoryId,
            category,
            restaurantId: _restaurantId,
            ...updateData
        } = data;

        if (data.categoryId) {
            updateData.category = { connect: { id: data.categoryId } };
        }

        return await prisma.menuItem.update({
            where: { id },
            data: updateData,
        });
    }

    async deleteMenuItem(id) {
        await this.getMenuItemById(id);
        return await prisma.menuItem.delete({
            where: { id },
        });
    }
}

module.exports = new MenuService();
