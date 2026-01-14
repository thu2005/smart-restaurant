const PDFDocument = require('pdfkit');
const axios = require('axios');
const { prisma } = require('../config/database');
const { generateQRBuffer } = require('../utils/qr.service');
const archiver = require('archiver');

const QR_BASE_URL = process.env.QR_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

const RESTAURANT_CONFIG = {
    name: "SMART BISTRO",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1996/1996068.png",
    wifi: { ssid: "SmartBistro_Guest", password: "Password123" }
};

async function fetchLogoBuffer() {
    try {
        const response = await axios.get(RESTAURANT_CONFIG.logoUrl, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) { return null; }
}

// Single Page
function drawSinglePage(doc, table, qrBuffer, logoBuffer) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    if (logoBuffer) {
        doc.image(logoBuffer, centerX - 30, 40, { width: 60 });
    }

    doc.font('Helvetica-Bold').fontSize(24)
        .text(RESTAURANT_CONFIG.name.toUpperCase(), 0, 110, { width: pageWidth, align: 'center' });

    doc.moveTo(50, 140).lineTo(pageWidth - 50, 140).lineWidth(2).stroke();

    doc.font('Helvetica-Bold').fontSize(36)
        .text(`TABLE ${table.tableNumber}`, 0, 160, { width: pageWidth, align: 'center' });

    doc.font('Helvetica').fontSize(14).fillColor('gray')
        .text(table.location || 'Dining Area', 0, 205, { width: pageWidth, align: 'center' });

    // QR Frame
    const qrSize = 200;
    const qrY = 250;
    doc.rect(centerX - (qrSize / 2) - 10, qrY - 10, qrSize + 20, qrSize + 20).lineWidth(1).strokeColor('#ddd').stroke();
    doc.image(qrBuffer, centerX - (qrSize / 2), qrY, { width: qrSize });

    // Instructions
    const textY = qrY + qrSize + 30;
    doc.fillColor('black').fontSize(18).font('Helvetica-Bold')
        .text('SCAN TO ORDER', 0, textY, { width: pageWidth, align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#555')
        .text('Use your camera to view the menu', 0, textY + 25, { width: pageWidth, align: 'center' });

    // Wifi Box
    const boxHeight = 80;
    const boxY = pageHeight - 120;
    doc.rect(50, boxY, pageWidth - 100, boxHeight).fill('#f9f9f9');
    doc.rect(50, boxY, pageWidth - 100, boxHeight).lineWidth(1).strokeColor('#ccc').stroke();

    doc.fillColor('#333').fontSize(12).font('Helvetica-Bold')
        .text('FREE WI-FI', 0, boxY + 15, { width: pageWidth, align: 'center' });
    doc.fontSize(12).font('Helvetica')
        .text(`Network: ${RESTAURANT_CONFIG.wifi.ssid}`, 0, boxY + 35, { width: pageWidth, align: 'center' });
    doc.text(`Password: ${RESTAURANT_CONFIG.wifi.password}`, 0, boxY + 52, { width: pageWidth, align: 'center' });
}

// GRID LAYOUT
function drawGridItem(doc, table, qrBuffer, x, y, cellWidth, cellHeight) {
    const contentCenterX = x + (cellWidth / 2);
    const contentStartY = y + 20;

    // Border
    doc.rect(x + 10, y + 10, cellWidth - 20, cellHeight - 20).lineWidth(1).strokeColor('#ddd').stroke();

    // Table Number
    doc.fillColor('black').font('Helvetica-Bold').fontSize(18)
        .text(`TABLE ${table.tableNumber}`, x, contentStartY, { width: cellWidth, align: 'center' });

    // Small QR Code
    const qrSize = 120;
    doc.image(qrBuffer, contentCenterX - (qrSize / 2), contentStartY + 30, { width: qrSize });

    // Scan text
    doc.fontSize(10).font('Helvetica-Bold')
        .text('SCAN TO ORDER', x, contentStartY + 30 + qrSize + 10, { width: cellWidth, align: 'center' });

    // Small Wifi
    doc.fontSize(8).font('Helvetica').fillColor('#555')
        .text(`Wifi: ${RESTAURANT_CONFIG.wifi.ssid}`, x, contentStartY + 30 + qrSize + 25, { width: cellWidth, align: 'center' });
}

exports.downloadQR = async (req, res) => {
    try {
        const { id } = req.params;
        const { format } = req.query;
        const table = await prisma.table.findUnique({ where: { id } });

        // Use qrCode as token, essentially
        if (!table || !table.qrCode) return res.status(404).json({ message: 'QR Code not generated yet' });

        // Use table.qrCode as the token in the URL
        const qrURL = `${QR_BASE_URL}/customer/menu-browse/${table.restaurantId}/${table.tableNumber}?token=${table.qrCode}`;
        const qrBuffer = await generateQRBuffer(qrURL);

        if (format === 'pdf') {
            const logoBuffer = await fetchLogoBuffer();
            const doc = new PDFDocument({ size: 'A4', margin: 0 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Table-${table.tableNumber}.pdf"`);
            doc.pipe(res);
            drawSinglePage(doc, table, qrBuffer, logoBuffer);
            doc.end();
        } else {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="table-${table.tableNumber}.png"`);
            res.send(qrBuffer);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
};

exports.downloadAllQR = async (req, res) => {
    try {
        const { format, layout, restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).send('Restaurant ID is required');
        }

        const tables = await prisma.table.findMany({
            where: {
                restaurantId: restaurantId,
                qrCode: { not: null }
            },
            orderBy: { tableNumber: 'asc' }
        });

        if (tables.length === 0) return res.status(404).send('No active QR codes found.');

        if (format === 'pdf') {
            const logoBuffer = await fetchLogoBuffer();
            const doc = new PDFDocument({ size: 'A4', margin: 0 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="All-Tables-QR.pdf"');
            doc.pipe(res);

            if (layout === 'grid') {
                const cols = 2;
                const rows = 3;
                const cellWidth = doc.page.width / cols;
                const cellHeight = doc.page.height / rows;
                let itemsOnPage = 0;

                for (const table of tables) {
                    // 6 table per page
                    if (itemsOnPage === cols * rows) {
                        doc.addPage();
                        itemsOnPage = 0;
                    }

                    const colIndex = itemsOnPage % cols;
                    const rowIndex = Math.floor(itemsOnPage / cols);
                    const x = colIndex * cellWidth;
                    const y = rowIndex * cellHeight;

                    const qrURL = `${QR_BASE_URL}/customer/menu-browse/${table.restaurantId}/${table.tableNumber}?token=${table.qrCode}`;
                    const qrBuffer = await generateQRBuffer(qrURL);

                    drawGridItem(doc, table, qrBuffer, x, y, cellWidth, cellHeight);
                    itemsOnPage++;
                }

            } else {
                // 1 table per page
                for (let i = 0; i < tables.length; i++) {
                    if (i > 0) doc.addPage();
                    const qrURL = `${QR_BASE_URL}/customer/menu-browse/${tables[i].restaurantId}/${tables[i].tableNumber}?token=${tables[i].qrCode}`;
                    const qrBuffer = await generateQRBuffer(qrURL);
                    drawSinglePage(doc, tables[i], qrBuffer, logoBuffer);
                }
            }

            doc.end();

        } else {
            // --- ZIP Logic ---
            const archive = archiver('zip', { zlib: { level: 9 } });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="All-Tables-QR-Images.zip"');
            archive.pipe(res);
            for (const table of tables) {
                const qrURL = `${QR_BASE_URL}/customer/menu-browse/${table.restaurantId}/${table.tableNumber}?token=${table.qrCode}`;
                const qrBuffer = await generateQRBuffer(qrURL);
                archive.append(qrBuffer, { name: `table-${table.tableNumber}.png` });
            }
            await archive.finalize();
        }

    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).send('Error');
    }
};
