import { useState } from "react";
import { useAppContext } from "../AppContext";
import "../styles/pageStyles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "lucide-react";
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
  const [searchName, setSearchName] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [sortField, setSortField] = useState<'category' | 'stock' | 'price' | 'total'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const filteredProducts = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesSupplier = product.supplier.toLowerCase().includes(searchSupplier.toLowerCase());
    return matchesName && matchesSupplier;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'category':
        valueA = a.category;
        valueB = b.category;
        break;
      case 'stock':
        valueA = a.stock;
        valueB = b.stock;
        break;
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;
      case 'total':
        valueA = a.price * a.stock;
        valueB = b.price * b.stock;
        break;
      default:
        valueA = a.category;
        valueB = b.category;
    }
    
    return sortOrder === 'asc' 
      ? valueA > valueB ? 1 : -1
      : valueA < valueB ? 1 : -1;
  });

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Estoque</h1>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 mb-4 mx-auto bg-white">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-slate-200 data-[state=inactive]:bg-transparent"
            >
              Transações
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="data-[state=active]:bg-slate-200 data-[state=inactive]:bg-transparent"
            >
              Estoque de Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <div className="content-card">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    className="search-input"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="action-button"
                  >
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
                      const transactionDetails =
                        getTransactionDetails(transaction);

                      return (
                        <TableRow key={transaction.id} className="table-row">
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                            {transactionDetails.date}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                            {transaction.type === "entrada"
                              ? "Entrada"
                              : "Saída"}
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
          </TabsContent>
          <TabsContent value="stock">
            <div className="content-card">
              <div className="grid grid-cols-4 gap-4 max-w-4xl mb-6 items-center">
                <Input
                  type="text"
                  placeholder="Buscar por nome do produto"
                  className="search-input w-[250px]"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Buscar por fornecedor"
                  className="search-input w-[250px]"
                  value={searchSupplier}
                  onChange={(e) => setSearchSupplier(e.target.value)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="action-button">
                      Ordenar por: {
                        sortField === 'category' ? 'Categoria' :
                        sortField === 'stock' ? 'Quantidade' :
                        sortField === 'price' ? 'Preço Unitário' :
                        'Valor Total'
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortField('category')}>
                      Categoria
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('stock')}>
                      Quantidade
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('price')}>
                      Preço Unitário
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('total')}>
                      Valor Total
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="outline" 
                  className="action-button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
                </Button>
              </div>
              <div className="table-container">
                <Table>
                  <TableHeader className="table-header">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Produto
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Categoria
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Fornecedor
                      </TableHead>
                      <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Quantidade em Estoque
                      </TableHead>
                      <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Valor Unitário
                      </TableHead>
                      <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                        Valor Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product.id} className="table-row">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                          {product.name}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                          {product.category}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                          {product.supplier}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                          {product.stock}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                          R$ {product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                          R$ {(product.price * product.stock).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default GerenTransFinan;