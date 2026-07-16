const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const findInvoice = async (orderId) => {
    try {
        const invoicePath = path.resolve(__dirname, `../../uploads/invoices/domfacetten-${orderId}.pdf`);
        if (fs.existsSync(invoicePath)) {
            return fs.readFileSync(invoicePath);
        }
        throw new Error("Invoice not found");
    } catch (error) {
        console.error("Error finding invoice:", error);
        throw error;
    }
};

const newInvoice = async (orderId, code) => {
    try {
        // 1. Vorlage einlesen (Die HTML Datei aus /models)
        const templatePath = path.resolve(__dirname, '../models/invoice.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        const userData = await prisma.orders.findUnique({
            where: {
                orderId: orderId
            },
            include: {
                user: true,
            }
        });

        const findCode = await prisma.codes.findFirst({
            where: {
                codeId: code
            }
        });

        const discountName = findCode ? findCode.codeId : '';
        const discountValue = findCode ? findCode.codeValue : 0
        const discount = 1 - discountValue
        
        const products = Array.isArray(userData.products) ? userData.products : [userData.products];
        const grandTotal = products.map(p => p.product.price * p.quantity).reduce((a, b) => a + b, 0);

        let shipping_cost = 0;
        if(grandTotal < 39) {
            shipping_cost += 1.55
        }

        // Generiere HTML-Zeilen für jedes Item
        const itemsHtml = products.map(p => {
            const itemPrice = p.product.price || 0;
            const quantity = p.quantity || 0;
            const totalPrice = itemPrice * quantity;
            return `<tr>
                <td>A${p.product.artnr}</td>
                <td>${p.product.name || ''}</td>
                <td>${parseFloat(itemPrice).toFixed(2)} €</td>
                <td>${quantity}</td>
                <td>${parseFloat(totalPrice).toFixed(2)} €</td>
            </tr>`;
        }).join('\n');

        // 2. Platzhalter für das HTML Objekt vorbereiten
        // Wir nehmen an, du nutzt {{ variable }} im HTML
        const variables = {
            datum: new Date().toLocaleDateString('de-DE'),
            order_id: orderId,
            customer_name: `${userData.user.first_name} ${userData.user.last_name || 'Teststraße'}`.trim(),
            customer_id: userData.user.userId || "",
            customer_adress: userData.user.address ? Object.values(userData.user.address).join(', ') : '',
            quantity: products.reduce((acc, p) => acc + p.quantity, 0) || 0,
            item_total: grandTotal || 100,
            grand_total: (parseFloat(grandTotal*discount) + shipping_cost).toFixed(2).replace('.', ','),
            shipping_cost: shipping_cost.toString(),
            discount_name: discountName || '',
            discount_value: (discountValue*100) || 0
        };

        // Platzhalter im HTML String austauschen (egal ob mit einfachen { } oder doppelten {{ }})
        for (const [key, value] of Object.entries(variables)) {
            // Tauscht {{ key }} aus
            htmlContent = htmlContent.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'gi'), value);
            // Tauscht { key } aus (als Fallback)
            htmlContent = htmlContent.replace(new RegExp(`{\\s*${key}\\s*}`, 'gi'), value);
        }

        // Ersetze den Items-Platzhalter mit den generierten Zeilen
        htmlContent = htmlContent.replace('<!-- ITEMS_PLACEHOLDER -->', itemsHtml);

        // 3. Von HTML zu PDF konvertieren (Kostenlos via Puppeteer Chromium)
        const browser = await puppeteer.launch({ 
            headless: "new", 
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });
        const page = await browser.newPage();
        
        // Das manipulierte HTML in die unsichtbare Seite laden
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 4. PDF Speichern und im Speicher halten
        const pdfBuf = await page.pdf({ 
            format: 'A4', 
            printBackground: true, 
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });
        await browser.close();

        // 5. PDF auf dem Server abspeichern
        const outputPath = path.resolve(__dirname, `../../uploads/invoices/domfacetten-${orderId}.pdf`);
        fs.writeFileSync(outputPath, pdfBuf);

        return { code: 200, message: 'PDF erfolgreich erstellt!', path: outputPath };

    } catch (error) {
        console.error(error);
        return {
            code: 500,
            message: 'Beim Erstellen ist etwas schiefgelaufen!'
        };
    }
};

module.exports = {
    newInvoice,
    findInvoice
}