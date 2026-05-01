
export class ApiResponse<T> {
    message: string;
    statusCode: number;
    data: T;
    success: boolean;
    constructor(statusCode: number, message: string, data: T, success: boolean = true) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
    }
}