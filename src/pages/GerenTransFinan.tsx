import { useState } from "react";
import { useAppContext } from "../AppContext";
import "../styles/pageStyles.css";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
  id: number;
  type: "entrada" | "saida";
  date: string;
  productId: number;
  quantity: number;
  totalValue: number;
  orderId?: number;
  description: string;
}

export function GerenTransFinan() {
  const { products, orders, transactions } = useAppContext();
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState("");

  const getTransactionDetails = (transaction: Transaction) => {
    const product = products.find((p) => p.id === transaction.productId);
    const order = transaction.orderId
      ? orders.find((o) => o.id === transaction.orderId)
      : null;

    return {
      productName: product?.name || "Produto não encontrado",
      orderInfo: order ? `Pedido #${order.id}` : "Movimentação manual",
      value: transaction.totalValue,
      date: new Date(transaction.date).toLocaleDateString(),
    };
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesDate = !dateFilter || transaction.date === dateFilter;
    return matchesType && matchesDate;
  });

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Histórico de Transações</h1>

        <div className="content-card">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                className="search-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <Button size="icon" variant="outline" className="action-button">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="action-button">
                  Filtrar por tipo:{" "}
                  {filterType === "all" ? "Todos" : filterType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("entrada")}>
                  Entrada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("saida")}>
                  Saída
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Data
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Tipo
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Produto
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Quantidade
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Origem
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Valor Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const transactionDetails = getTransactionDetails(transaction);

                  return (
                    <TableRow key={transaction.id} className="table-row">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                        {transactionDetails.date}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {transaction.type === "entrada" ? "Entrada" : "Saída"}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {transactionDetails.productName}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                        {transaction.quantity}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {transactionDetails.orderInfo}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                        R$ {transaction.totalValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GerenTransFinan;
