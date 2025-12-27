const { prisma } = require('../config/database');

class RestaurantService {
    async getAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [restaurants, total] = await Promise.all([
            prisma.restaurant.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.restaurant.count(),
        ]);

        return { restaurants, total, page, pages: Math.ceil(total / limit) };
    }

    async getById(id) {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
        });
        if (!restaurant) throw new Error('Restaurant not found');
        return restaurant;
    }

    async create(data) {
        return await prisma.restaurant.create({
            data,
        });
    }

    async update(id, data) {
        // Check existence
        await this.getById(id);
        return await prisma.restaurant.update({
            where: { id },
            data,
        });
    }

    async delete(id) {
        await this.getById(id);
        return await prisma.restaurant.delete({
            where: { id },
        });
    }
}

module.exports = new RestaurantService();
