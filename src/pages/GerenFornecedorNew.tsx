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
  
  

  // Filtros e ordenação
  const filteredSuppliers = suppliers.filter((supplier) => {
    const nameMatches = supplier.nome && supplier.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const contactMatches = supplier.contato && supplier.contato.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatches || contactMatches;
  });

  const sortedAndFilteredSuppliers = filteredSuppliers.sort((a, b) => {
    if (sortOrder === "asc") {
      if (a[filterType as keyof Supplier] && b[filterType as keyof Supplier]) {
        return (a[filterType as keyof Supplier] as string).localeCompare(b[filterType as keyof Supplier] as string);
      }
      return 0;
    } else {
      if (a[filterType as keyof Supplier] && b[filterType as keyof Supplier]) {
        return (b[filterType as keyof Supplier] as string).localeCompare(a[filterType as keyof Supplier] as string);
      }
      return 0;
    }
  });

  // Verificando se os fornecedores estão sendo carregados corretamente
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSuppliers.length > 0 ? (
                sortedAndFilteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.nome}</TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.contato}</TableCell>
                    <TableCell>{supplier.endereco}</TableCell>
                    <TableCell>
                      <Button variant="link">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="link">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>Nenhum fornecedor encontrado</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
