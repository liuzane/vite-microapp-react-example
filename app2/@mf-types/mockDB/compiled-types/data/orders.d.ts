export interface Order {
    id: number;
    orderNo: string;
    productName: string;
    amount: number;
    status: string;
    createTime: string;
    customerName: string;
    phone: string;
    address: string;
}
declare const orders: Order[];
export default orders;
