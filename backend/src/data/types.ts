import { Product, Users, Orders, Cart, Codes } from "@prisma/client";

type ServiceResponse = {
    code: number;
    message: string;
    data?:
        | Orders[]
        | Orders
        | Users
        | Product
        | Product[]
        | Cart[]
        | Cart
        | string
        | object
        | null;
};

type ResponseObject<GenericResponse = Product | Product[] | Users | Orders | Cart | Cart[] | Codes | string | object | null> = {
    status: "SUCCESS" | "FAILURE";
    message: string;
    data?: {
        reqData: GenericResponse;
        furtherInfo?: string;
    };
    error?: string;
};

type NewObject<GenericResponse> = {
    status: "SUCCESS" | "FAILURE";
    message: string;
    data?: {
        reqData: GenericResponse;
        furtherInfo?: string;
    };
    error?: string;
};

export { ServiceResponse, ResponseObject };
