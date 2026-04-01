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

        const parseKeywords = (value) => {
            if (value == null) return [];
            if (Array.isArray(value)) return value;
            const str = String(value).trim();
            if (!str) return [];
            if (str.startsWith("[")) {
                try {
                    const parsed = JSON.parse(str);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return str
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean);
        };

        const files = req.files || {};
        const heroFile = files.heroImage?.[0];
        const secondFile = files.secondImage?.[0];
        const thirdFile = files.thirdImage?.[0];

        const heroImage = heroFile?.filename || body.heroImage;
        const secondImage = secondFile?.filename || body.secondImage || null;
        const thirdImage = thirdFile?.filename || body.thirdImage || null;

        if (!heroImage) {
            return res
                .status(400)
                .json({ message: "Foto 1 (heroImage) ist verpflichtend" });
        }

        const arttype = body.arttype;
        const artnr = body.artnr != null ? parseInt(body.artnr, 10) : undefined;
        const name = body.name;
        const description = body.description;
        const keywords = parseKeywords(body.keywords);
        const price = body.price; // Prisma Decimal ist oft am sichersten als String
        const available =
            body.available === true ||
            body.available === "true" ||
            body.available === "on" ||
            body.available === 1 ||
            body.available === "1";

        const newDataSet = {
            arttype,
            artnr,
            name,
            description,
            keywords,
            price,
            available,
            heroImage,
            secondImage,
            thirdImage,
        };

        const newProduct = await productService.createNewProduct(newDataSet);
        if (newProduct.code && newProduct.code === 500) {
            return res
                .status(500)
                .json({ message: "Fehler beim Erstellen des Produkts" });
        }
        return res.status(201).json({
            code: 201,
            message: "Produkt erfolgreich erstellt",
            product: newProduct,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Fehler beim Erstellen des Produkts" });
    }
}

async function deleteProduct(req, res) {
    try {
        const { arttype, artnr } = req.body;
        const result = await productService.deleteExistingProductWithImages(
            arttype,
            artnr,
        );
        if (result && result.code && result.code !== 200) {
            return res
                .status(result.code)
                .json({ message: "failure", info: result.message });
        }
        return res.status(200).json({
            message: "success",
            info: `Deleted Product with ID: ${arttype}${artnr}`,
            deletedFiles: result?.deletedFiles || [],
            fileDeleteErrors: result?.fileDeleteErrors || [],
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "failure", info: "Produkt nicht gelöscht!" });
    }
}

async function updateProduct(req, res) {
    try {
        const { data } = req.body || {};
        if (!data || typeof data !== "object") {
            return res.status(400).json({
                message: "failure",
                info: "Keine Update-Daten erhalten.",
            });
        }
        let checkedData = {};
        for (const key in data) {
            if (
                data[key] !== undefined &&
                data[key] !== null &&
                data[key] !== "" &&
                data[key] !== NaN
            ) {
                checkedData[key] = data[key];
            }
        }
        const product = await productService.updateExistingProduct(checkedData);
        return res
            .status(200)
            .json({ message: "success", updatedProduct: product });
    } catch (error) {
        return res.status(500).json({
            message: "failure",
            info: "Aktualisierung fehlgeschagen.",
        });
    }
}

module.exports = { fetchProducts, createProduct, deleteProduct, updateProduct };
