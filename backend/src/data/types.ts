import { Product, Users, Orders, Cart } from "@prisma/client";

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

type ResponseObject = {
    status: "SUCCESS" | "FAILURE";
    message: string;
    data?: {
        reqData: Users | Product[] | Product | string | Cart[] | Cart;
        furtherInfo?: string;
    };
    error?: string;
};

export { ServiceResponse, ResponseObject };
