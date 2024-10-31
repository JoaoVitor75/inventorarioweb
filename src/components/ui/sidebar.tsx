import { HandCoins, Package, Settings, ShoppingCart, Users2, DollarSign, UserRoundPen } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path ? 'text-bold text-darker' : 'text-muted-foreground';

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/')}`}
            >
              <UserRoundPen className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Login</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/orders"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/orders')}`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Orders</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Orders</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/products"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/products')}`}
            >
              <Package className="h-5 w-5" />
              <span className="sr-only">Products</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Products</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/clients"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/clients')}`}
            >
              <Users2 className="h-5 w-5" />
              <span className="sr-only">Customers</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Customers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/suppliers"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/suppliers')}`}
            >
              <HandCoins className="h-5 w-5" />
              <span className="sr-only">Suppliers</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Suppliers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/transactions"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('/transactions')}`}
            >
              <DollarSign className="h-5 w-5" />
              <span className="sr-only">Transaction</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Transaction</TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="#"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive('#')}`}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export default Sidebar;
