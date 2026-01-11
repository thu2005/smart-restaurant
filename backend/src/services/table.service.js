const { prisma } = require('../config/database');
const { generateQRCode } = require('../utils/qr.service');
const { generateTableToken } = require('../utils/token');

class TableService {
    async createTable(data) {
        const { restaurantId, tableNumber, capacity, location } = data;

        // Check if table number already exists for this restaurant
        const existingTable = await prisma.table.findUnique({
            where: {
                restaurantId_tableNumber: {
                    restaurantId,
                    tableNumber
                }
            }
        });

        if (existingTable) {
            if (existingTable.isActive) {
                // Reactivate table if it was soft deleted
                return await prisma.table.update({
                    where: { id: existingTable.id },
                    data: {
                        isActive: false,
                        capacity: capacity || existingTable.capacity,
                        location: location || existingTable.location,
                        status: 'AVAILABLE'
                    }
                });
            }
            throw new Error(`Table number ${tableNumber} already exists in this restaurant`);
        }


        return await prisma.table.create({
            data: {
                restaurantId,
                tableNumber,
                capacity: capacity || 4,
                location,
                status: 'AVAILABLE'
            }
        });
    }

    async getTablesByRestaurant(restaurantId) {
        return await prisma.table.findMany({
            where: {
                restaurantId
            },
            orderBy: { tableNumber: 'asc' },
            include: {
                _count: {
                    select: { orders: { where: { status: { not: 'COMPLETED' } } } }
                }
            }
        });
    }

    async getTableById(id) {
        return await prisma.table.findUnique({
            where: { id }
        });
    }

    async updateTable(id, data) {
        // Prevent updating tableNumber to duplicate
        if (data.tableNumber) {
            const table = await prisma.table.findUnique({ where: { id } });
            if (!table) throw new Error("Table not found");

            const existing = await prisma.table.findUnique({
                where: {
                    restaurantId_tableNumber: {
                        restaurantId: table.restaurantId,
                        tableNumber: data.tableNumber
                    }
                }
            });

            if (existing && existing.id !== id) {
                throw new Error(`Table number ${data.tableNumber} already exists`);
            }
        }

        return await prisma.table.update({
            where: { id },
            data
        });
    }

    async deleteTable(id) {
        // Soft delete by setting isActive to false
        return await prisma.table.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async toggleTableActive(id) {
        // Get current state and toggle
        const table = await prisma.table.findUnique({ where: { id } });
        if (!table) throw new Error("Table not found");
        
        return await prisma.table.update({
            where: { id },
            data: { isActive: !table.isActive }
        });
    }

    async updateQRToken(id, token) {
        // Also regenerate QR Code URL image
        const table = await prisma.table.findUnique({ where: { id } });
        if (!table) throw new Error("Table not found");

        const baseURL = process.env.QR_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
        // Pass restaurantId, tableNumber, and token in the customer path
        const qrContent = `${baseURL}/customer/menu-browse/ab386fe4-b539-40e7-8c7a-fa0d725d7c13/${table.tableNumber}?token=${token}`;
        const qrCodeUrl = await generateQRCode(qrContent);

        return await prisma.table.update({
            where: { id },
            data: {
                qrCode: token,
                qrCodeUrl: qrCodeUrl
            }
        });
    }

    async regenerateAllQRs(restaurantId) {
        const tables = await prisma.table.findMany({
            where: {
                restaurantId
            }
        });

        let count = 0;
        const updates = [];

        for (const table of tables) {
            const newToken = generateTableToken(table.id, table.tableNumber, restaurantId);
            updates.push(this.updateQRToken(table.id, newToken));
            count++;
        }

        await Promise.all(updates);
        return count;
    }
}

module.exports = new TableService();
