import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductsPage from './pages/GerenProdutos';
import SuppliersPage from './pages/GerenFornecedores';
import { ClientsPage } from './pages/GerenClientes';
import OrdersPage from './pages/GerenPedidos';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Sidebar from './components/ui/sidebar';
import { GerenTransFinan } from "./pages/GerenTransFinan";

const App = () => {
  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="ml-12 flex-1">
        <TooltipProvider>
        <Sidebar />
        </TooltipProvider>
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/transactions" element={<GerenTransFinan />} />
          </Routes>
      </div>
      </div>
  );
};

export default App;
