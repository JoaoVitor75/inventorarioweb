import { useAppContext } from "../AppContext";
import { useState } from "react";
import "../index.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../styles/pageStyles.css";

import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "../styles/pageStyles.css";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  image: string;
}

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

export function ProductsPage() {
  const isValidPrice = (price: number) => price > 0;
  const isValidQuantity = (quantity: number) =>
    Number.isInteger(quantity) && quantity > 0;
  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const { products, setProducts, suppliers, transactions, setTransactions } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    image: "",
    price: 0,
    stock: 0,
    supplier: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterType, setFilterType] = useState<"name" | "supplier">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleAddProduct = async () => {
    if (!newProduct.supplier) {
      alert("Por favor, selecione um fornecedor.");
      return;
    }
    if (!isValidPrice(newProduct.price)) {
      alert("O preço deve ser maior que zero.");
      return;
    }
    if (!isValidQuantity(newProduct.stock)) {
      alert("A quantidade deve ser um número inteiro positivo.");
      return;
    }
    if (!isValidImageUrl(newProduct.image)) {
      alert("A URL da imagem é inválida.");
      return;
    }
  
    try {
      // Monta o objeto do produto
      const product = { ...newProduct, id: Date.now() };
  
      // Envia a requisição POST
      const response = await fetch('http://localhost:3000/produto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }
  
      const createdProduct = await response.json();
  
      // Atualiza a lista de produtos com a resposta do servidor
      setProducts([...products, createdProduct]);
  
      // Registra a transação
      const transaction: Transaction = {
        id: Date.now(),
        type: "entrada" as const,
        date: new Date().toISOString().split("T")[0],
        productId: createdProduct.id,
        quantity: createdProduct.stock,
        totalValue: createdProduct.price * createdProduct.stock,
        description: "Estoque inicial",
      };
  
      setTransactions([...transactions, transaction]);
      setNewProduct({
        name: "",
        category: "",
        price: 0,
        stock: 0,
        supplier: "",
        image: "",
      });
  
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao adicionar produto.');
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      if (!isValidPrice(editingProduct.price)) {
        alert("O preço deve ser maior que 0.");
        return;
      }
      if (!isValidQuantity(editingProduct.stock)) {
        alert("A quantidade deve ser um número positivo.");
        return;
      }
      if (!isValidImageUrl(editingProduct.image)) {
        alert("A URL da imagem é inválida.");
        return;
      }
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
    }

    if (editingProduct) {
      const originalProduct = products.find((p) => p.id === editingProduct.id);
      const stockDifference =
        editingProduct.stock - (originalProduct?.stock || 0);

      if (stockDifference !== 0) {
        handleProductTransaction(
          editingProduct,
          Math.abs(stockDifference),
          stockDifference > 0 ? "entrada" : "saida"
        );
      }

      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredAndSortedProducts = products
    .filter((product) =>
      product[filterType].toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Produtos</h1>

        <div className="content-card">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
            <div className="search-bar">
              <Input
                placeholder="Buscar produtos..."
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
                  Filtrar por {filterType === "name" ? "Nome" : "Fornecedor"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("name")}>
                  Nome
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("supplier")}>
                  Fornecedor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="action-button"
            >
              Ordenar por Preço{" "}
              {sortOrder === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-indigo-900">
                    Adicionar Novo Produto
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
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="category"
                      className="text-right text-indigo-700"
                    >
                      Categoria
                    </Label>
                    <Input
                      id="category"
                      className="col-span-3 rounded-lg"
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="price"
                      className="text-right text-indigo-700"
                    >
                      Preço
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      className="col-span-3 rounded-lg"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="stock"
                      className="text-right text-indigo-700"
                    >
                      Estoque
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      className="col-span-3 rounded-lg"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="supplier"
                      className="text-right text-indigo-700"
                    >
                      Fornecedor
                    </Label>
                    <select
                      id="supplier"
                      className="col-span-3 rounded-lg"
                      value={newProduct.supplier}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          supplier: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione um fornecedor</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="image"
                      className="text-right text-indigo-700"
                    >
                      Imagem URL
                    </Label>
                    <Input
                      id="image"
                      className="col-span-3 rounded-lg"
                      value={newProduct.image}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, image: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddProduct}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full"
                >
                  Adicionar Produto
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Image
                  </TableHead>
                  <TableHead className="w-[100px] px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Nome
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Categoria
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Preço
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Estoque
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Fornecedor
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow key={product.id} className="table-row">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                      {product.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {product.category}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                      R$ {product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                      {product.stock}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      {product.supplier}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="edit-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-indigo-900">
                Editar Produto
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
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-category"
                  className="text-right text-indigo-700"
                >
                  Categoria
                </Label>
                <Input
                  id="edit-category"
                  className="col-span-3 rounded-lg"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-price"
                  className="text-right text-indigo-700"
                >
                  Preço
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  className="col-span-3 rounded-lg"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-stock"
                  className="text-right text-indigo-700"
                >
                  Estoque
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  className="col-span-3 rounded-lg"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-image"
                  className="text-right text-indigo-700"
                >
                  Imagem URL
                </Label>
                <Input
                  id="edit-image"
                  className="col-span-3 rounded-lg"
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-supplier"
                  className="text-right text-indigo-700"
                >
                  Fornecedor
                </Label>
                <select
                  id="edit-supplier"
                  className="col-span-3 rounded-lg"
                  value={editingProduct.supplier}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      supplier: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>{" "}
            </div>
            <Button onClick={handleUpdateProduct}>Atualizar Produto</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProductsPage;
function handleProductTransaction(
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    supplier: string;
    image: string;
  },
  stock: number,
  arg2: string
) {
  throw new Error("Function not implemented.");
}