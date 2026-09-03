"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
const client_1 = require("@prisma/client");
function handleError(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "string")
        return error;
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return "Duplikat-Fehler.";
        }
        if (error.code === "P2025") {
            return "Datensatz nicht gefunden.";
        }
        if (error.code === "P2003") {
            return "Fremdschlüsselverletzung.";
        }
    }
    return "Ein unbekannter Fehler ist aufgetreten.";
}
