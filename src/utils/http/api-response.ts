
export class ApiResponse<T> {
    message: string;
    statusCode: number;
    data: T;
    success: boolean;
    constructor(message: string, statusCode: number, data: T, success: boolean) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
    }
}