import React, { createContext, useState, useContext } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  image: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  cnpj: string;
}

interface Client {
  id: number;
  name: string;
  cpf_cnpj: string;
  contact: string;
  address: string;
  isActive: boolean;
}

interface Order {
  id: number;
  clientId: number;
  date: string;
  status: string;
  total: number;
}

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  return (
    <AppContext.Provider value={{ products, setProducts, suppliers, setSuppliers, clients, setClients, orders, setOrders }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
