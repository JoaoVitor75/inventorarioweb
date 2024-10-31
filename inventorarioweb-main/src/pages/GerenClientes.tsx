import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import "../styles/pageStyles.css";
import { Link } from "react-router-dom";

import "../index.css";

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
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function ClientsPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { clients, setClients, orders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState<Omit<Client, "id" | "isActive">>({
    name: "",
    cpf_cnpj: "",
    contact: "",
    address: "",
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterType, setFilterType] = useState<"name" | "cpf_cnpj">("name");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const isCpfCnpjUnique = (cpfCnpj: string, clientId?: number) => {
    return !clients.some(
      (client) => client.cpf_cnpj === cpfCnpj && client.id !== clientId
    );
  };

  const validateClient = (client: Partial<Client>) => {
    const errors: string[] = [];
    if (!client.name) errors.push("Nome é obrigatório.");
    if (!client.cpf_cnpj) errors.push("CPF/CNPJ é obrigatório.");
    if (!client.contact) errors.push("Contato é obrigatório.");
    return errors;
  };

  const handleAddClient = () => {
    const errors = validateClient(newClient);
    if (errors.length > 0) {
      errors.forEach((error) => alert(error));
      return;
    }
    if (!isCpfCnpjUnique(newClient.cpf_cnpj)) {
      alert("CPF/CNPJ já está em uso por outro cliente.");
      return;
    }
    setClients([...clients, { ...newClient, id: Date.now(), isActive: true }]);
    setNewClient({ name: "", cpf_cnpj: "", contact: "", address: "" });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = () => {
    if (editingClient) {
      const errors = validateClient(editingClient);
      if (errors.length > 0) {
        errors.forEach((error) => alert(error));
        return;
      }
      if (!isCpfCnpjUnique(editingClient.cpf_cnpj, editingClient.id)) {
        alert("CPF/CNPJ já está em uso por outro cliente.");
        return;
      }
      setClients(
        clients.map((c) => (c.id === editingClient.id ? editingClient : c))
      );
      setEditingClient(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteClient = (id: number) => {
    const clientToDelete = clients.find((c) => c.id === id);
    if (clientToDelete) {
      const hasTransactions = orders.some((order) => order.clientId === id);
      if (hasTransactions) {
        setClients(
          clients.map((c) => (c.id === id ? { ...c, isActive: false } : c))
        );
        alert(
          "Cliente possui transações associadas. O cliente foi desativado em vez de excluído."
        );
      } else {
        setClients(clients.filter((c) => c.id !== id));
      }
    }
  };

  const filteredClients = clients.filter((client) =>
    client[filterType].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientOrders = selectedClient
    ? orders.filter((order) => order.clientId === selectedClient.id)
    : [];

  const filteredOrders =
    orderStatusFilter === "all"
      ? clientOrders
      : clientOrders.filter((order) => order.status === orderStatusFilter);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-10 text-center">
          Gerenciamento de Clientes
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="search-bar">
              <Input
                placeholder="Buscar clientes..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button size="icon" variant="outline" className="search-button">
                <Search className="h-6 w-6" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filtrar por {filterType === "name" ? "Nome" : "CPF/CNPJ"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("name")}>
                  Nome
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("cpf_cnpj")}>
                  CPF/CNPJ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                  <Button className="add-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-indigo-900">
                    Adicionar Novo Cliente
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="name"
                      className="text-right text-indigo-700"
                    >
                      Nome
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3 rounded-lg"
                      value={newClient.name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="cpf_cnpj"
                      className="text-right text-indigo-700"
                    >
                      CPF/CNPJ
                    </Label>
                    <Input
                      id="cpf_cnpj"
                      className="col-span-3 rounded-lg"
                      value={newClient.cpf_cnpj}
                      onChange={(e) =>
                        setNewClient({ ...newClient, cpf_cnpj: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="contact"
                      className="text-right text-indigo-700"
                    >
                      Contato
                    </Label>
                    <Input
                      id="contact"
                      className="col-span-3 rounded-lg"
                      value={newClient.contact}
                      onChange={(e) =>
                        setNewClient({ ...newClient, contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="address"
                      className="text-right text-indigo-700"
                    >
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      className="col-span-3 rounded-lg"
                      value={newClient.address}
                      onChange={(e) =>
                        setNewClient({ ...newClient, address: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAddClient} className="add-button">
                  Adicionar Cliente
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Nome
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    CPF/CNPJ
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Contato
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Endereço
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="table-row">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {client.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {client.cpf_cnpj}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {client.contact}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {client.address}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {client.isActive ? "Ativo" : "Inativo"}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="action-button edit-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          className="action-button delete-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          className="action-button"
                        >
                          Histórico
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {selectedClient && (
          <div className="content-card">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
              Histórico de Pedidos - {selectedClient.name}
            </h2>
            <div className="mb-4">
              <Label htmlFor="orderStatus" className="mr-2">
                Filtrar por status:
              </Label>
              <select
                id="orderStatus"
                className="rounded-lg border-indigo-200"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="table-container">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                      ID do Pedido
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                      Data
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="table-row">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {order.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {order.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                        {order.status}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                        R$ {order.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-indigo-900">
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-name"
                  className="text-right text-indigo-700"
                >
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3 rounded-lg"
                  value={editingClient.name}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-cpf_cnpj"
                  className="text-right text-indigo-700"
                >
                  CPF/CNPJ
                </Label>
                <Input
                  id="edit-cpf_cnpj"
                  className="col-span-3 rounded-lg"
                  value={editingClient.cpf_cnpj}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      cpf_cnpj: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-contact"
                  className="text-right text-indigo-700"
                >
                  Contato
                </Label>
                <Input
                  id="edit-contact"
                  className="col-span-3 rounded-lg"
                  value={editingClient.contact}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      contact: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-address"
                  className="text-right text-indigo-700"
                >
                  Endereço
                </Label>
                <Input
                  id="edit-address"
                  className="col-span-3 rounded-lg"
                  value={editingClient.address}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <Button
            onClick={handleUpdateClient}
            
          >
            Atualizar Cliente
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientsPage;
