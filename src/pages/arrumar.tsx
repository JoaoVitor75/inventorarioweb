import { useAppContext } from "../AppContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../index.css";
import "../styles/PageStyles.css";
import { Supplier as ISupplier } from "@/@types/ISupplier"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Função para carregar fornecedores do backend
    useEffect(() => {
      console.log("Carregando fornecedores...");  // Verifique se isso aparece no console
    
      const fetchSuppliers = async () => {
        try {
          const response = await fetch("http://localhost:3000/fornecedores");
          console.log("Resposta da requisição:", response);  // Verifica a resposta da requisição
    
          if (!response.ok) {
            throw new Error("Erro ao carregar fornecedores");
          }
    
          const data = await response.json();
          console.log("Dados recebidos do backend:", data);  // Verifica se os dados estão corretos
    
          // Verifica se os dados estão no formato esperado
          if (Array.isArray(data)) {
            setSuppliers(data);
          } else {
            throw new Error("Dados inválidos recebidos do backend");
          }
    
        } catch (err) {
          console.error("Erro ao carregar fornecedores:", err);  // Verifica o erro no console
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Um erro desconhecido ocorreu");
          }
        } finally {
          console.log("Requisição concluída.");
          setLoading(false);
        }
      };
    
      fetchSuppliers();
    }, []);

  const isValidName = (name: string) => name.trim() !== "";

  const isValidCnpj = (cnpj: string) => {
    const numericCnpj = cnpj.replace(/\D/g, ''); // Remove non-digits
    return numericCnpj.length === 14;
  };

  const isValidContact = (contact: string) => contact.trim() !== "";

  const isCnpjUnique = (cnpj: string, currentId?: number) => {
    return !suppliers.some((s) => s.cnpj === cnpj && s.id !== currentId);
  };

  const handleSupplierTransaction = (
    supplier: Supplier,
    type: "entrada" | "saida"
  ) => {
    console.log(`Transação de ${type} realizada para o fornecedor ${supplier.nome}.`);
  }

  const handleAddSupplier = async () => {
    if (!isValidName(newSupplier.nome)) {
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
    if (!isValidContact(newSupplier.contato)) {
      alert("Contato é obrigatório.");
      return;
    }

    // Chama o endpoint do backend para adicionar o fornecedor
    try {
      const response = await fetch("http://localhost:3000/fornecedor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSupplier),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message); // Exibe a mensagem de erro se houver
        return;
      }

      const addedSupplier = await response.json();
      setSuppliers([...suppliers, addedSupplier]);
      handleSupplierTransaction(addedSupplier, "entrada"); // Registro da transação
      setNewSupplier({ nome: "", cnpj: "", contato: "", endereco: "" });
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      alert("Ocorreu um erro ao adicionar o fornecedor.");
    }
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
      handleSupplierTransaction(editingSupplier, "entrada");
      setEditingSupplier(null);
    }
  };

  const handleDeleteSupplier = (id: number) => {
    const supplierToDelete = suppliers.find((s) => s.id === id);
    if (supplierToDelete) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      handleSupplierTransaction(supplierToDelete, "saida");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    // Verifique se 'name' e 'contact' são definidos e faça o toLowerCase com segurança
    const nameMatches = supplier.nome && supplier.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const contactMatches = supplier.contato && supplier.contato.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatches || contactMatches;
  });
  
  const sortedAndFilteredSuppliers = filteredSuppliers.sort((a, b) => {
    if (sortOrder === "asc") {
      if (filterType === "name" && a.nome && b.nome) {
        return a.nome.localeCompare(b.nome);
      } else if (filterType === "contact" && a.contato && b.contato) {
        return a.contato.localeCompare(b.contato);
      }
      return 0;
    } else {
      if (filterType === "name" && a.nome && b.nome) {
        return b.nome.localeCompare(a.nome);
      } else if (filterType === "contact" && a.contato && b.contato) {
        return b.contato.localeCompare(a.contato);
      }
      return 0;
    }
  });

  // Renderização da tabela e a exibição dos fornecedores
  if (loading) return <div>Carregando fornecedores...</div>;
  if (error) return <div>Erro: {error}</div>;

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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Fornecedor</DialogTitle>
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
                  <Button onClick={handleAddSupplier}>Adicionar</Button>
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
    </div>
  );
}


export default SuppliersPage;