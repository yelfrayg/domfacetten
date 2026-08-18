import { PrismaClient, Product } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "path";
import fs from "fs/promises";
import { ServiceResponse } from "../data/types";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["warn", "error"],
});

const uploadDir = path.resolve(__dirname, "..", "..", "uploads", "products");

const slugify = (value: any) => {
    const str = String(value ?? "")
        .trim()
        .toLowerCase();
    const slug = str
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
    return slug;
};

const safeUnlink = async (absoluteFilePath: string) => {
    try {
        await fs.unlink(absoluteFilePath);
        return { ok: true };
    } catch (err: unknown) {
        const fsError = err as NodeJS.ErrnoException;
        if (fsError?.code === "ENOENT") return { ok: true, missing: true };
        return {
            ok: false,
            error: err instanceof Error ? err : new Error(String(err)),
        };
    }
};

const getAllProducts = async (): Promise<ServiceResponse> => {
    try {
        const products: Product[] = await prisma.product.findMany();
        const response: ServiceResponse = {
            code: 200,
            message: "Produkte erfolgreich geladen",
            data: products,
        };
        return response;
    }
    catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: "Fehler beim Laden der Produkte",
        };
        return response;
    }
};

const getSingleProduct = async (arttype: string, artnr: string): Promise<Product | null> => {
    try {
        const parsedArtnr = parseInt(artnr, 10);
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

const createNewProduct = async (data: any) => {
    try {
        return await prisma.product.create({
            data: {
                arttype: data.arttype,
                artnr: data.artnr,
                name: data.name,
                description: data.description,
                keywords: data.keywords,
                price: data.price,
                inStock: parseInt(data.inStock),
                heroImage: data.heroImage,
                image2: data.secondImage,
                image3: data.thirdImage,
            },
        });
    } catch (error: any) {
        if (
            error.code === 'P2002'
        ) {
            // Optional: Prüfen, welches Feld betroffen war (falls meta.target vorhanden ist)
            const target = error.meta?.target;
            return {
                code: 409, // Conflict
                message: `Ein Produkt mit dieser ${target} existiert bereits.`,
            };
        }

        return {
            code: 500,
            message: "Fehler beim Erstellen des Produkts",
        }
    }
};

const deleteExistingProduct = async (arttype: string, artnr: string) => {
    try {
        // Durch neue TS-Syntax ersetzen.
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

const deleteExistingProductWithImages = async (arttype: string, artnr: string) => {
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
    ].filter((filename): filename is string => Boolean(filename));

    const artnrPart = `a${String(parsedArtnr).replace(/\D/g, "")}`;
    const arttypePart = `t${slugify(arttype) || "unknown"}`;
    const newPrefix = `${arttypePart}-${artnrPart}-`;
    const oldPrefix = `${artnrPart}-`;

    let fileNamesToDelete = new Set<string>(filenamesFromDb);

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

    const deletedFiles: string[] = [];
    const fileDeleteErrors: Array<{ filename: string; error: string }> = [];
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

const updateExistingProduct = async (data: any) => {
    try {
        const parsedArtnr = parseInt(data?.artnr, 10);

        const updateData = { ...data };
        delete updateData.artnr;

        const update = await prisma.product.update({
            where: {
                artnr: parsedArtnr,
            },
            data: updateData,
        });

        const response: ServiceResponse = {
            code: 200,
            message: "Produkt erfolgreich aktualisiert",
        }        
        return response;
    } catch (error) {

        const response: ServiceResponse = {
            code: 500,
            message: "Aktualisierung in DB fehlgeschlagen",
        }
        return response;
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