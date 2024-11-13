import { useAppContext } from "../AppContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../index.css";
import "../styles/PageStyles.css";
import { Supplier as ISupplier } from "@/@types/ISupplier";
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

interface Supplier {
  id: number;
  nome: string;
  cnpj: string;
  contato: string;
  endereco: string;
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, "id">>({
    nome: "",
    cnpj: "",
    contato: "",
    endereco: "",
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"name" | "contact">("name");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controle do modal

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:3000/fornecedores");
        if (!response.ok) {
          throw new Error("Erro ao carregar fornecedores");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSuppliers(data);
        } else {
          throw new Error("Dados inválidos recebidos do backend");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Um erro desconhecido ocorreu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleAddSupplier = async () => {
    try {
      const response = await fetch("http://localhost:3000/fornecedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message);
        return;
      }

      const addedSupplier = await response.json();
      setSuppliers([...suppliers, addedSupplier]);
      setNewSupplier({ nome: "", cnpj: "", contato: "", endereco: "" });
      setIsDialogOpen(false); // Fecha o modal
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      alert("Ocorreu um erro ao adicionar o fornecedor.");
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      nome: supplier.nome,
      cnpj: supplier.cnpj,
      contato: supplier.contato,
      endereco: supplier.endereco,
    });
    setIsDialogOpen(true); // Abre o modal
  };

  const handleUpdateSupplier = async () => {
    if (editingSupplier) {
      try {
        const response = await fetch(
          `http://localhost:3000/fornecedor/${editingSupplier.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSupplier),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message);
          return;
        }
        const updatedSupplier = await response.json();
        setSuppliers(
          suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
        );
        setEditingSupplier(null);
        setIsDialogOpen(false); // Fecha o modal
      } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        alert("Ocorreu um erro ao atualizar o fornecedor.");
      }
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/fornecedor/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        alert("Erro ao excluir fornecedor.");
        return;
      }
      setSuppliers(suppliers.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      alert("Ocorreu um erro ao excluir o fornecedor.");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const nameMatches =
      supplier.nome &&
      supplier.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const contactMatches =
      supplier.contato &&
      supplier.contato.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatches || contactMatches;
  });

  const sortedAndFilteredSuppliers = filteredSuppliers.sort((a, b) => {
    const key = filterType === "name" ? "nome" : "contato";
    return sortOrder === "asc"
      ? a[key].localeCompare(b[key])
      : b[key].localeCompare(a[key]);
  });

  if (loading) return <div>Carregando fornecedores...</div>;
  if (error) return <div>Erro: {error}</div>;
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Fornecedores</h1>

        <div className="content-card">
          {/* Resto do código da interface de pesquisa e filtros */}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full"
                onClick={() => {
                  setEditingSupplier(null); // Limpa o fornecedor em edição
                  setNewSupplier({ nome: "", cnpj: "", contato: "", endereco: "" });
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}
                </DialogTitle>
              </DialogHeader>
              <div>
                <Label>Nome</Label>
                <Input
                  value={newSupplier.nome}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, nome: e.target.value })
                  }
                />
                <Label>CNPJ</Label>
                <Input
                  value={newSupplier.cnpj}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, cnpj: e.target.value })
                  }
                />
                <Label>Contato</Label>
                <Input
                  value={newSupplier.contato}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contato: e.target.value })
                  }
                />
                <Label>Endereço</Label>
                <Input
                  value={newSupplier.endereco}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, endereco: e.target.value })
                  }
                />
                <Button onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}>
                  {editingSupplier ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.nome}</TableCell>
                <TableCell>{supplier.cnpj}</TableCell>
                <TableCell>{supplier.contato}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => handleEditSupplier(supplier)}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SuppliersPage;