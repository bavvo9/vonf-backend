// src/types/index.ts

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user'; // Tipado más estricto
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  track_stock: boolean;
  image_url: string;
  is_active?:boolean;
  category_id?: number;
  category_name?: string;
  is_featured?:string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock?: number;
  track_stock?: boolean;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string; // Unificamos a snake_case como viene de la BD
  country: string;
  phone: string;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}