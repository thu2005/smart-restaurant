const { prisma } = require('../config/database');
const QRCode = require('qrcode');
const crypto = require('crypto');

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
            throw new Error(`Table number ${tableNumber} already exists in this restaurant`);
        }

        // Generate a unique QR text/token
        // Format: https://smart-restaurant.com/menu/restaurantId/tableNumber
        // Or just a unique token. Let's make a deep link format for the frontend.
        const qrContent = `${process.env.FRONTEND_URL}/menu/${restaurantId}/${tableNumber}`;
        const qrToken = crypto.randomBytes(16).toString('hex'); // For the unique field

        // Generate QR Code Image (Data URL)
        const qrCodeUrl = await QRCode.toDataURL(qrContent);

        return await prisma.table.create({
            data: {
                restaurantId,
                tableNumber,
                capacity: capacity || 4,
                location,
                qrCode: qrToken,
                qrCodeUrl: qrCodeUrl,
                status: 'AVAILABLE'
            }
        });
    }

    async getTablesByRestaurant(restaurantId) {
        return await prisma.table.findMany({
            where: { restaurantId },
            orderBy: { tableNumber: 'asc' },
            include: {
                _count: {
                    select: { orders: { where: { status: { not: 'COMPLETED' } } } } // Active orders count?
                }
            }
        });
    }

    async deleteTable(id) {
        // Check if table has active orders?
        // cascading delete is set to Cascade in schema? Let's check schema.
        // Schema: orders Order[] ... no onDelete specified on Order side usually means restrict or set null, 
        // but let's just allow delete for now as per schema (Restaurant->Table is Cascade, Table->Order might prevent).
        // Actually schema said: table Table @relation... onDelete: Cascade. So it's safe.

        return await prisma.table.delete({
            where: { id }
        });
    }
}

module.exports = new TableService();
