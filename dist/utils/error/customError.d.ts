declare class CustomError extends Error {
    code: number;
    constructor(message: string, code?: number);
}
export default CustomError;
