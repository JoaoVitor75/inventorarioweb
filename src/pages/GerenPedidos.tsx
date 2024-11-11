import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import "../styles/pageStyles.css";
import { format } from "date-fns";


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
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  clientId: number;
  date: Date;
  status: "pending" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
}


export function OrdersPage() {
  const {
    orders,
    setOrders,
    clients,
    products,
    setProducts,
    transactions,
    setTransactions,
  } = useAppContext();
  

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "all">(
    "all"
  );
  const [sortField, setSortField] = useState<"date" | "total">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [newOrder, setNewOrder] = useState<Omit<Order, "id">>({
    clientId: 0,
    date: new Date(),
    status: "pending",
    items: [],
    total: 0,
  });
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<{
    [key: number]: number;
  }>({});

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    if (!selectedProductQuantities[productId]) {
      setSelectedProductQuantities((prev) => ({ ...prev, [productId]: 1 }));
    }
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      setSelectedProductQuantities((prev) => ({
        ...prev,
        [productId]: product.stock,
      }));
    } else {
      setSelectedProductQuantities((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  const addSelectedProductsToOrder = () => {
    selectedProducts.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const newItem: OrderItem = {
          productId,
          quantity: selectedProductQuantities[productId] || 1,
          price: product.price,
        };
        setCurrentOrderItems((prev) => [...prev, newItem]);
      }
    });
    setSelectedProducts([]);
    setSelectedProductQuantities({});
  };

  const handleAddOrder = () => {
    const orderId = Date.now();
    const total = currentOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrderWithItems = {
      ...newOrder,
      id: orderId,
      date: new Date(),
      items: currentOrderItems,
      total,
    };

    {
      products.map((product) => (
        <div key={product.id} className="flex items-center space-x-2 my-1">
          <input
            type="checkbox"
            id={`product-${product.id}`}
            checked={selectedProducts.includes(product.id)}
            onChange={() => toggleProductSelection(product.id)}
          />
          <label htmlFor={`product-${product.id}`}>{product.name}</label>
          {selectedProducts.includes(product.id) && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateProductQuantity(
                    product.id,
                    (selectedProductQuantities[product.id] || 1) - 1
                  )
                }
                disabled={(selectedProductQuantities[product.id] || 1) <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center">
                {selectedProductQuantities[product.id] || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateProductQuantity(
                    product.id,
                    (selectedProductQuantities[product.id] || 1) + 1
                  )
                }
                disabled={
                  (selectedProductQuantities[product.id] || 1) >=
                  (products.find((p) => p.id === product.id)?.stock || 0)
                }
              >
                +
              </Button>
            </div>
          )}
        </div>
      ));    }
    const newTransactions = currentOrderItems.map((item) => ({
      id: Date.now() + item.productId,
      type: "saida" as const,
      date: new Date().toISOString().split("T")[0],
      productId: item.productId,
      quantity: item.quantity,
      totalValue: item.price * item.quantity,
      orderId: orderId,
      description: `Pedido #${orderId}`,
    }));

    // Update product stock levels
    const updatedProducts = products.map(product => {
      const orderItem = currentOrderItems.find(item => item.productId === product.id);
      if (orderItem) {
        return {
          ...product,
          stock: product.stock - orderItem.quantity
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setTransactions([...transactions, ...newTransactions]);
    setOrders([...orders, newOrderWithItems]);
    setNewOrder({
      clientId: 0,
      date: new Date(),
      status: "pending",
      items: [],
      total: 0,
    });
    setCurrentOrderItems([]);
    setIsAddDialogOpen(false);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setCurrentOrderItems(order.items);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = () => {
    if (editingOrder) {
      const updatedOrder = {
        ...editingOrder,
        items: currentOrderItems,
        total: currentOrderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
      setOrders(
        orders.map((o) => (o.id === editingOrder.id ? updatedOrder : o))
      );
      setEditingOrder(null);
      setCurrentOrderItems([]);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const filteredAndSortedOrders = orders
    .filter(
      (order) =>
        (filterStatus === "all" || order.status === filterStatus) &&
        (!filterDate || order.date.toString() === filterDate.toDateString()) &&
        (order.id.toString().includes(searchTerm) ||
          clients
            .find((c) => c.id === order.clientId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === "asc" ? a.total - b.total : b.total - a.total;
      }
    });

  function addProductToOrder(arg0: number, arg1: number) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Pedidos</h1>

        <div className="content-card">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="search-bar">
              <Input
                placeholder="Buscar pedidos..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button size="icon" variant="outline" className="search-button">
                <Search className="h-6 w-6" />
              </Button>
            </div>

            <Select
              value={filterStatus}
              onValueChange={(value: Order["status"] | "all") =>
                setFilterStatus(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluí­do</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() =>
                setSortField(sortField === "date" ? "total" : "date")
              }
            >
              Ordenar por {sortField === "date" ? "Data" : "Valor Total"}
            </Button>
            <Button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                  <Button className="add-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pedido
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-indigo-900">
                    Adicionar Novo Pedido
                  </DialogTitle>
                </DialogHeader>
                <Select
                  onValueChange={(value: any) =>
                    setNewOrder({ ...newOrder, clientId: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <h3>Selecione os produtos:</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2 my-1"
                      >
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                        <label htmlFor={`product-${product.id}`}>
                          {product.name}
                        </label>
                        {selectedProducts.includes(product.id) && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                updateProductQuantity(
                                  product.id,
                                  (selectedProductQuantities[product.id] || 1) -
                                    1
                                )
                              }
                              disabled={
                                (selectedProductQuantities[product.id] || 1) <=
                                1
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {selectedProductQuantities[product.id] || 1}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                updateProductQuantity(
                                  product.id,
                                  (selectedProductQuantities[product.id] || 1) +
                                    1
                                )
                              }
                              disabled={
                                (selectedProductQuantities[product.id] || 1) >=
                                (products.find((p) => p.id === product.id)
                                  ?.stock || 0)
                              }
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}                  </div>
                </div>

                <Button onClick={addSelectedProductsToOrder}>
                  Adicionar Produtos Selecionados
                </Button>
                <div>
                  <h3>Itens do Pedido:</h3>
                  {currentOrderItems.map((item, index) => (
                    <div key={index}>
                      {products.find((p) => p.id === item.productId)?.name} -
                      Quantidade: {item.quantity}
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddOrder}>Adicionar Pedido</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAndSortedOrders.map((order) => (
                  <TableRow key={order.id} className="table-row">
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {clients.find((c) => c.id === order.clientId)?.name}
                    </TableCell>
                    <TableCell>{format(order.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedOrder = {
                              ...order,
                              status: "completed" as const,
                            };
                            setOrders(
                              orders.map((o) =>
                                o.id === order.id ? updatedOrder : o
                              )
                            );
                          }}
                          className="action-button"
                          disabled={
                            order.status === "completed" ||
                            order.status === "cancelled"
                          }
                        >
                          Concluir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedOrder = {
                              ...order,
                              status: "cancelled" as const,
                            };
                            setOrders(
                              orders.map((o) =>
                                o.id === order.id ? updatedOrder : o
                              )
                            );
                          }}
                          className="action-button"
                          disabled={
                            order.status === "completed" ||
                            order.status === "cancelled"
                          }
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="action-button edit-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="action-button delete-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                          className="action-button view-button"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-indigo-900">
                Editar Pedido
              </DialogTitle>
            </DialogHeader>
            <div>
              <h3>Itens do Pedido:</h3>
              {currentOrderItems.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={index}
                    className="space-y-4 border p-4 rounded-lg mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <Select
                        defaultValue={item.productId.toString()}
                        onValueChange={(value) => {
                          const newItems = [...currentOrderItems];
                          newItems[index].productId = Number(value);
                          setCurrentOrderItems(newItems);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newItems = currentOrderItems.filter(
                            (_, i) => i !== index
                          );
                          setCurrentOrderItems(newItems);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...currentOrderItems];
                            newItems[index].quantity = Number(e.target.value);
                            setCurrentOrderItems(newItems);
                          }}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Preço Unitário</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...currentOrderItems];
                            newItems[index].price = Number(e.target.value);
                            setCurrentOrderItems(newItems);
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      Total: R$ {(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={handleUpdateOrder}>Atualizar Pedido</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-indigo-900">
                Detalhes do Pedido
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div>
                <h3>Itens do Pedido:</h3>
                {selectedOrder.items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 my-2"
                    >
                      <img
                        src={product?.image}
                        alt={product?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">{product?.name}</p>
                        <p>Quantidade: {item.quantity}</p>
                        <p>Preço: R$ {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
                <p className="mt-4 font-bold">
                  Total: R$ {selectedOrder.total.toFixed(2)}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default OrdersPage;