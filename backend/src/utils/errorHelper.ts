import { Prisma } from "@prisma/client";

export function handleError<E>(error: E): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return "Duplikat-Fehler.";
        }
        if (error.code === "P2025") {
            return "Datensatz nicht gefunden.";
        }
        if(error.code === "P2003") {
            return "Fremdschlüsselverletzung.";
        }
    }
    return "Ein unbekannter Fehler ist aufgetreten.";
}
