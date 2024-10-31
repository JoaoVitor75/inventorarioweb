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
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface Transaction {
  id: number;
  type: 'entrada' | 'saida';
  date: string;
  productId: number;
  quantity: number;
  totalValue: number;
  orderId?: number;
  description: string;
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
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleProductTransaction = (product: Product, quantity: number, type: 'entrada' | 'saida', orderId?: number) => {
    const newTransaction = {
      id: Date.now(),
      type,
      date: new Date().toISOString().split('T')[0],
      productId: product.id,
      quantity,
      totalValue: product.price * quantity,
      orderId,
      description: orderId ? `Pedido #${orderId}` : `${type === 'entrada' ? 'Adição' : 'Remoção'} manual de estoque`
    };
    
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      suppliers,
      setSuppliers,
      clients,
      setClients,
      orders,
      setOrders,
      transactions,
      setTransactions,
    }}>
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
