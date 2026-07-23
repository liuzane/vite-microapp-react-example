export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    roleId: number;
    createTime: string;
    lastLoginTime: string;
}
declare const users: User[];
export default users;
