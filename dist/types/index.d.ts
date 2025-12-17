export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface SessionData {
    userId: number;
    email: string;
    permissions: string[];
    roles: string[];
    createdAt: string;
    lastActivity: string;
}
export interface UserDTO {
    username: string;
    email: string;
    url: string;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map