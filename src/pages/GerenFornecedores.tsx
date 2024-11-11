import { useAppContext } from "../AppContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../index.css";
import "../styles/PageStyles.css";
import {Supplier} from "@/@types/ISupplier"

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


export function SuppliersPage() {
  const { suppliers, setSuppliers } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, "id">>({
    name: "",
    cnpj: "",
    contact: "",
    address: "",
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"name" | "contact">("name");
  const isValidName = (name: string) => name.trim() !== "";

  const isValidCnpj = (cnpj: string) => {
    const numericCnpj = cnpj.replace(/\D/g, ''); // Remove non-digits
    return numericCnpj.length === 14;
  };

  const isValidContact = (contact: string) => contact.trim() !== "";

  const isCnpjUnique = (cnpj: string, currentId?: number) => {
    return !suppliers.some((s) => s.cnpj === cnpj && s.id !== currentId);
  };

  const handleAddSupplier = () => {
    if (!isValidName(newSupplier.name)) {
      alert("Nome é obrigatório.");
      return;
    }
    if (!isValidCnpj(newSupplier.cnpj)) {
      alert("CNPJ é obrigatório.");
      return;
    }
    if (!isCnpjUnique(newSupplier.cnpj)) {
      alert("CNPJ já cadastrado.");
      return;
    }
    if (!isValidContact(newSupplier.contact)) {
      alert("Contato é obrigatório.");
      return;
    }
    setSuppliers([...suppliers, { ...newSupplier, id: Date.now() }]);
    setNewSupplier({ name: "", cnpj: "", contact: "", address: "" });
  };
  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
  };

  const handleUpdateSupplier = () => {
    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id ? editingSupplier : s
        )
      );
      setEditingSupplier(null);
    }
  };

  const handleDeleteSupplier = (id: number) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  <Input
    id="cnpj"
    className="col-span-3 rounded-lg"
    value={newSupplier.cnpj}
    maxLength={14}
    pattern="\d{14}"
    onChange={(e) => {
      const numericValue = e.target.value.replace(/\D/g, '');
      setNewSupplier({ ...newSupplier, cnpj: numericValue });
    }}
  />
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredSuppliers = filteredSuppliers.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[filterType].localeCompare(b[filterType]);
    } else {
      return b[filterType].localeCompare(a[filterType]);
    }
  });

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Fornecedores</h1>

        <div className="content-card">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
            <div className="search-bar">
              <Input
                placeholder="Buscar fornecedores..."
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
                <Button variant="outline" className="action-button">
                  Filtrar por {filterType === "name" ? "Nome" : "Contato"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("name")}>
                  Nome
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("contact")}>
                  Contato
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="action-button"
            >
              Ordenar{" "}
              {sortOrder === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-indigo-900">
                    Adicionar Novo Fornecedor
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
                      value={newSupplier.name}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, name: e.target.value })
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
                      value={newSupplier.contact}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          contact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="cnpj"
                      className="text-right text-indigo-700"
                    >
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      className="col-span-3 rounded-lg"
                      value={newSupplier.cnpj}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, cnpj: e.target.value })
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
                      value={newSupplier.address}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddSupplier}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full"
                >
                  Adicionar Fornecedor
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="w-[100px] px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Nome
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Contato
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Endereço
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="table-row">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                      {supplier.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {supplier.contact}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {supplier.address}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSupplier(supplier)}
                          className="edit-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="delete-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {editingSupplier && (
        <Dialog
          open={!!editingSupplier}
          onOpenChange={() => setEditingSupplier(null)}
        >
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-indigo-900">
                Editar Fornecedor
              </DialogTitle>
            </DialogHeader>
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
                  value={editingSupplier.name}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      name: e.target.value,
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
                  value={editingSupplier.contact}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
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
                  value={editingSupplier.address}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button onClick={handleUpdateSupplier}>Atualizar Fornecedor</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default SuppliersPage;

