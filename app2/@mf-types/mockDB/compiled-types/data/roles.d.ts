export interface Role {
    id: number;
    name: string;
    code: string;
    status: string;
    userCount: number;
    createTime: string;
    description: string;
}
declare const roles: Role[];
export default roles;
