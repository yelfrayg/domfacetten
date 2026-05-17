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

const newInvoice = async (orderId) => {
    try {
        // 1. Vorlage einlesen (Die HTML Datei aus /models)
        const templatePath = path.resolve(__dirname, '../models/invoice.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Es soll der Nutzer mit der die Order mit der orderId gemacht hat gefunden werden
        const userData = await prisma.orders.findUnique({
            where: {
                orderId: orderId
            },
            include: {
                user: true,
            }
        });
        
        const products = Array.isArray(userData.products) ? userData.products : [userData.products];
        const grandTotal = products.map(p => p.product.price * p.quantity).reduce((a, b) => a + b, 0);

        // 2. Platzhalter für das HTML Objekt vorbereiten
        // Wir nehmen an, du nutzt {{ variable }} im HTML
        const variables = {
            datum: new Date().toLocaleDateString('de-DE'),
            order_id: orderId,
            customer_name: `${userData.user.first_name} ${userData.user.last_name || 'Teststraße'}`.trim(),
            customer_id: userData.user.userId || "",
            customer_adress: userData.user.address ? Object.values(userData.user.address).join(', ') : '',
            quantity: products.reduce((acc, p) => acc + p.quantity, 0) || 0,
            item_id: products.map(p => 'A' + p.product.artnr).join(', ') || '',
            item_price: products.map(p => p.product.price || 0).join(', ') || '',
            item_total: grandTotal || 100,
            grand_total: (grandTotal + 5).toFixed(2), // z.B. + 5.00 Versand
            shipping_cost: "5.00"
        };

        // Platzhalter im HTML String austauschen (egal ob mit einfachen { } oder doppelten {{ }})
        for (const [key, value] of Object.entries(variables)) {
            // Tauscht {{ key }} aus
            htmlContent = htmlContent.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'gi'), value);
            // Tauscht { key } aus (als Fallback)
            htmlContent = htmlContent.replace(new RegExp(`{\\s*${key}\\s*}`, 'gi'), value);
        }

        // 3. Von HTML zu PDF konvertieren (Kostenlos via Puppeteer Chromium)
        const browser = await puppeteer.launch({ 
            // headless: 'new' sorgt dafür, dass kein sichtbares Fenster aufploppt
            headless: "new", 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
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