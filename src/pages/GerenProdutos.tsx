import { useAppContext } from "../AppContext";
import { useState } from "react";
import "../index.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import '../styles/pageStyles.css'

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
import '../styles/pageStyles.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  image: string;
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

  const { products, setProducts, suppliers } = useAppContext();

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

  const handleAddProduct = () => {
    if (!isValidPrice(newProduct.price)) {
      alert("O preço deve ser maior que 0.");
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
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name: '', category: '', price: 0, stock: 0, supplier: '', image: '' });
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
        alert("A quantidade deve ser um número inteiro positivo.");
        return;
      }
      if (!isValidImageUrl(editingProduct.image)) {
        alert("A URL da imagem é inválida.");
        return;
      }
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-10 text-center">
          Gerenciamento de Produtos
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2 w-full md:w-1/2">
              <Input
                placeholder="Buscar produtos..."
                className="w-full rounded-full border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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

          <div className="overflow-x-auto rounded-xl shadow-md">
            <Table>
              <TableHeader className="bg-indigo-100">
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
                  <TableRow
                    key={product.id}
                    className="hover:bg-indigo-50 transition-colors duration-200"
                  >
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
                          className="text-indigo-600 hover:text-indigo-800 rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 rounded-full"
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
            <Button
              onClick={handleUpdateProduct}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-full"
            >
              Atualizar Produto
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProductsPage;
