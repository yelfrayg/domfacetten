const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require("path");
const fs = require("fs/promises");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const uploadDir = path.resolve(__dirname, "..", "..", "uploads", "products");

const slugify = (value) => {
    const str = String(value ?? "")
        .trim()
        .toLowerCase();
    const slug = str
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
    return slug;
};

const safeUnlink = async (absoluteFilePath) => {
    try {
        await fs.unlink(absoluteFilePath);
        return { ok: true };
    } catch (err) {
        if (err && err.code === "ENOENT") return { ok: true, missing: true };
        return { ok: false, error: err };
    }
};

const getAllProducts = async () => {
    try {
        return await prisma.product.findMany();
    } catch (error) {
        return [];
    }
};

const getSingleProduct = async (arttype, artnr) => {
    try {
        const parsedArtnr = parseInt(artnr, 10);
        if (Number.isNaN(parsedArtnr)) {
            return null;
        }
        return await prisma.product.findFirst({
            where: {
                arttype,
                artnr: parsedArtnr,
            },
        });
    } catch (error) {
        return null;
    }
};

const createNewProduct = async (data) => {
    try {
        return await prisma.product.create({
            data: {
                arttype: data.arttype,
                artnr: data.artnr,
                name: data.name,
                description: data.description,
                keywords: data.keywords,
                price: data.price,
                available: data.available,
                heroImage: data.heroImage,
                image2: data.secondImage,
                image3: data.thirdImage,
            },
        });
    } catch (error) {
        return {
            code: 500,
            message: "Fehler beim Erstellen",
        };
    }
};

const deleteExistingProduct = async (arttype, artnr) => {
    try {
        // In the current Prisma schema, only `artnr` is unique.
        // We use `deleteMany` to still honor the intended (arttype + artnr) filter.
        return await prisma.product.deleteMany({
            where: {
                arttype: arttype,
                artnr: parseInt(artnr, 10),
            },
        });
    } catch (error) {
        return error;
    }
};

const deleteExistingProductWithImages = async (arttype, artnr) => {
    const parsedArtnr = parseInt(artnr, 10);
    if (!arttype || Number.isNaN(parsedArtnr)) {
        return { code: 400, message: "Ungültige Parameter (arttype/artnr)" };
    }

    const product = await prisma.product.findFirst({
        where: {
            arttype,
            artnr: parsedArtnr,
        },
    });

    if (!product) {
        return { code: 404, message: "Produkt nicht gefunden" };
    }

    const deleteResult = await prisma.product.deleteMany({
        where: {
            arttype,
            artnr: parsedArtnr,
        },
    });

    const filenamesFromDb = [
        product.heroImage,
        product.image2,
        product.image3,
    ].filter(Boolean);

    const artnrPart = `a${String(parsedArtnr).replace(/\D/g, "")}`;
    const arttypePart = `t${slugify(arttype) || "unknown"}`;
    const newPrefix = `${arttypePart}-${artnrPart}-`;
    const oldPrefix = `${artnrPart}-`;

    let fileNamesToDelete = new Set(filenamesFromDb);

    // Also delete any additional files for the same arttype+artnr prefix (e.g. -2 suffixes)
    try {
        const entries = await fs.readdir(uploadDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isFile()) continue;
            const name = entry.name;
            if (name.startsWith(newPrefix)) {
                fileNamesToDelete.add(name);
            }
        }
    } catch {
        // ignore if directory is missing/unreadable
    }

    // Backwards compatibility: old filenames didn't include arttype.
    // Only delete old-prefix files if there is no other product with same artnr but different arttype.
    try {
        const otherCount = await prisma.product.count({
            where: {
                artnr: parsedArtnr,
                NOT: { arttype },
            },
        });

        if (otherCount === 0) {
            const entries = await fs.readdir(uploadDir, {
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                const name = entry.name;
                if (name.startsWith(oldPrefix)) {
                    fileNamesToDelete.add(name);
                }
            }
        }
    } catch {
        // ignore
    }

    const deletedFiles = [];
    const fileDeleteErrors = [];
    for (const filename of fileNamesToDelete) {
        // prevent path traversal: only allow plain filenames
        if (filename.includes("/") || filename.includes("\\")) continue;

        const fullPath = path.join(uploadDir, filename);
        const result = await safeUnlink(fullPath);
        if (result.ok) {
            deletedFiles.push(filename);
        } else {
            fileDeleteErrors.push({
                filename,
                error: String(result.error?.message || result.error),
            });
        }
    }

    return {
        code: 200,
        deletedCount: deleteResult.count,
        deletedFiles,
        fileDeleteErrors,
        product,
    };
};

const updateExistingProduct = async (data) => {
    try {
        const parsedArtnr = parseInt(data?.artnr, 10);
        if (Number.isNaN(parsedArtnr)) {
            return { code: 400, message: "Ungültige artnr" };
        }

        const updateData = { ...data };
        delete updateData.artnr;

        return await prisma.product.update({
            where: {
                artnr: parsedArtnr,
            },
            data: updateData,
        });
    } catch (error) {
        return { code: 500, message: "Aktualisierung in DB fehlgeschlagen" };
    }
};

module.exports = {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    deleteExistingProduct,
    deleteExistingProductWithImages,
    updateExistingProduct,
};