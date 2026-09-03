"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productService = require("../services/productService");
const errorHelper_1 = require("../utils/errorHelper");
async function fetchProducts(req, res) {
    try {
        const allProducts = await productService.getAllProducts();
        const responseObject = {
            status: allProducts.code === 200 ? "SUCCESS" : "FAILURE",
            message: allProducts.message,
            data: {
                reqData: allProducts.data || [],
                furtherInfo: "Liste alle Produkte in der Datenbank.",
            },
        };
        res.status(allProducts.code).json(responseObject);
    }
    catch (error) {
        const responseObject = {
            status: "FAILURE",
            message: "Fehler beim Laden der Produkte",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(responseObject);
    }
}
async function fetchProductByArtNr(req, res) {
    try {
        const { arttype, artnr } = req.params;
        const product = await productService.getSingleProduct(arttype, artnr);
        const responseObject = {
            status: product ? "SUCCESS" : "FAILURE",
            message: product
                ? "Produkt erfolgreich geladen"
                : "Produkt nicht gefunden",
            data: {
                reqData: product ? product : "Produkt nicht gefunden",
                furtherInfo: product
                    ? undefined
                    : "Dieses Produkt existiert nicht in der Datenbank.",
            },
        };
        return res.status(200).json(responseObject);
    }
    catch (error) {
        console.error("Fehler beim Laden des Produkts:", error);
        const responseObject = {
            status: "FAILURE",
            message: "Fehler beim Laden des Produkts",
            data: {
                reqData: "Fehler beim Laden des Produkts",
            },
        };
        return res.status(500).json(responseObject);
    }
}
async function createProduct(req, res) {
    try {
        const body = req.body || {};
        const parseKeywords = (value) => {
            if (value == null)
                return [];
            if (Array.isArray(value))
                return value;
            const str = String(value).trim();
            if (!str)
                return [];
            if (str.startsWith("[")) {
                try {
                    const parsed = JSON.parse(str);
                    return Array.isArray(parsed) ? parsed : [];
                }
                catch {
                    return [];
                }
            }
            return str
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean);
        };
        const files = req
            .files || {};
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
        const inStock = body.inStock;
        const newDataSet = {
            arttype,
            artnr,
            name,
            description,
            keywords,
            price,
            inStock,
            heroImage,
            secondImage,
            thirdImage,
        };
        const newProduct = await productService.createNewProduct(newDataSet);
        if (newProduct.code) {
            return res
                .status(newProduct.code)
                .json({ message: newProduct.message });
        }
        return res.status(201).json({
            code: 201,
            message: "Produkt erfolgreich erstellt",
            product: newProduct,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        return res.status(500).json({ message });
    }
}
async function deleteProduct(req, res) {
    try {
        const { arttype, artnr } = req.body;
        const result = await productService.deleteExistingProductWithImages(arttype, artnr);
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
    }
    catch (error) {
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
        const typedData = data;
        const checkedData = {};
        for (const key in typedData) {
            const value = typedData[key];
            if (value !== undefined &&
                value !== null &&
                value !== "" &&
                !(typeof value === "number" && Number.isNaN(value))) {
                checkedData[key] = value;
            }
        }
        const product = await productService.updateExistingProduct(checkedData);
        const responseObject = {
            status: product ? "SUCCESS" : "FAILURE",
            message: product
                ? "Produkt erfolgreich aktualisiert"
                : "Produkt nicht gefunden",
            data: {
                reqData: product || "Produkt nicht gefunden",
                furtherInfo: product
                    ? undefined
                    : "Dieses Produkt existiert nicht in der Datenbank.",
            },
        };
        return res.status(product.code).json(responseObject);
    }
    catch (error) {
        const responseObject = {
            status: "FAILURE",
            message: "Internes Serverproblem",
            data: {
                reqData: "Fehler beim Aktualisieren des Produkts",
                furtherInfo: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
            },
        };
        return res.status(500).json(responseObject);
    }
}
module.exports = {
    fetchProducts,
    fetchProductByArtNr,
    createProduct,
    deleteProduct,
    updateProduct,
};
