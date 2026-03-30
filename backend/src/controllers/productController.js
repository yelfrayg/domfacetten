const productService = require("../services/productService");

async function fetchProducts(req, res) {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json({ message: "success", products: products });
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
        return res
            .status(500)
            .json({ message: "Fehler beim Laden der Produkte" });
    }
}

async function createProduct(req, res) {
    try {
        const body = req.body || {};
        const files = req.files || {};

        const heroFile = files.heroImage?.[0];
        const secondFile = files.secondImage?.[0];
        const thirdFile = files.thirdImage?.[0];

        if (!heroFile?.filename) {
            return res
                .status(400)
                .json({ message: 'Foto 1 (heroImage) ist verpflichtend' });
        }

        const artnr = body.artnr != null ? parseInt(body.artnr, 10) : NaN;
        if (!Number.isFinite(artnr)) {
            return res
                .status(400)
                .json({ message: 'Ungültige Artikelnummer (artnr)' });
        }

        const keywords = (() => {
            const raw = body.keywords;
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            return String(raw)
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean);
        })();

        const available =
            body.available === true ||
            body.available === 'true' ||
            body.available === 'on' ||
            body.available === 1 ||
            body.available === '1';

        const productData = {
            arttype: body.arttype || '',
            artnr,
            name: body.name || '',
            description: body.description || '',
            keywords,
            price: body.price || '0',
            available,
            heroImage: heroFile.filename,
            image2: secondFile?.filename || null,
            image3: thirdFile?.filename || null,
        };

        const created = await productService.createProduct(productData);
        if (created?.code === 500) {
            return res
                .status(500)
                .json({ message: 'Fehler beim Erstellen des Produkts' });
        }

        return res
            .status(201)
            .json({ message: 'Produkt erfolgreich erstellt', product: created });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Fehler beim Erstellen des Produkts" });
    }
}

module.exports = { fetchProducts, createProduct };
