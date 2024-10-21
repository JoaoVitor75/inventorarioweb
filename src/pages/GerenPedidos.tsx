import React, { useState } from 'react'
import { useAppContext } from '../AppContext'
import '../styles/pageStyles.css'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Part 1: Interfaces and Initial State
interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  clientId: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
}

export function OrdersPage() {
  const { orders, setOrders, clients, products } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [sortField, setSortField] = useState<'date' | 'total'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [newOrder, setNewOrder] = useState<Omit<Order, 'id'>>({
    clientId: 0,
    date: new Date(),
    status: 'pending',
    items: [],
    total: 0
  });
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Part 2: CRUD Operations
  const handleAddOrder = () => {
    const orderId = Date.now();
    setOrders([...orders, { ...newOrder, id: orderId }]);
    setNewOrder({ clientId: 0, date: new Date(), status: 'pending', items: [], total: 0 });
    setIsAddDialogOpen(false);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setEditingOrder(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // Part 3: Filtering and Sorting
  const filteredAndSortedOrders = orders
    .filter(order => 
      (filterStatus === 'all' || order.status === filterStatus) &&
      (!filterDate || order.date.toDateString() === filterDate.toDateString()) &&
      (order.id.toString().includes(searchTerm) || 
       clients.find(c => c.id === order.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime();
      } else {
        return sortDirection === 'asc' ? a.total - b.total : b.total - a.total;
      }
    });

  // Part 4: Render
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Gerenciamento de Pedidos</h1>
        
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
            <DatePicker
              selected={filterDate}
              onSelect={setFilterDate}
              placeholderText="Filtrar por data"
            />
            <Select value={filterStatus} onValueChange={(value: Order['status'] | 'all') => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setSortField(sortField === 'date' ? 'total' : 'date')}>
              Ordenar por {sortField === 'date' ? 'Data' : 'Valor Total'}
            </Button>
            <Button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="add-button">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-indigo-900">Adicionar Novo Pedido</DialogTitle>
                </DialogHeader>
                {/* Add order form */}
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
                    <TableCell>{clients.find(c => c.id === order.clientId)?.name}</TableCell>
                    <TableCell>{format(order.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)} className="action-button edit-button">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteOrder(order.id)} className="action-button delete-button">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              <DialogTitle className="text-2xl font-semibold text-indigo-900">Editar Pedido</DialogTitle>
            </DialogHeader>
            {/* Edit order form */}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default OrdersPage;
