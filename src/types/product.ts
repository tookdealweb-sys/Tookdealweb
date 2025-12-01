export interface Product {
  id: number;
  title: string;
  description: string;
  price: string; // Django returns Decimal as string
  created_at: string;
}
