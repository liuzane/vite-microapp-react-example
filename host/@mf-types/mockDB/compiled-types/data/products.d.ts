export interface Product {
    id: number;
    productNo: string;
    name: string;
    price: number;
    stock: number;
    sales: number;
    category: string;
    status: string;
    supplier: string;
    createTime: string;
    description: string;
}
declare const products: Product[];
export default products;
