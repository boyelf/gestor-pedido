'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

interface Product {
  descripcion: string;
  cantidad: number;
  precio: number;
}

const CrearPedidoPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(0);

  const addProduct = () => {
    if (descripcion.trim() && cantidad > 0 && precio >= 0) {
      setProducts([...products, { descripcion, cantidad, precio }]);
      setDescripcion('');
      setCantidad(1);
      setPrecio(0);
    }
  };

  const deleteProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const total = products.reduce((sum, product) => sum + product.cantidad * product.precio, 0);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Crear Pedido</h1>

      {/* Add Product Form */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Agregar Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              min="1"
            />
            <Input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
          <Button onClick={addProduct} className="mt-4 flex items-center gap-2">
            <Plus size={16} />
            Agregar Producto
          </Button>
        </CardContent>
      </Card>

      {/* Product List */}
      <div className="space-y-4 mb-6">
        <div>
            <label className="text-md font-medium text-slate-700 dark:text-slate-300">Cantidad de articulos: {products.length}</label>
        </div>        
        {products.map((product, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                    <p className="text-slate-900 dark:text-slate-100">{product.descripcion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label>
                    <p className="text-slate-900 dark:text-slate-100">{product.cantidad}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Precio</label>
                    <p className="text-slate-900 dark:text-slate-100">${product.precio.toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProduct(index)}
                  className="ml-4"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer with Total */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Total:</span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>
          {/* <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Cant. articulos:</span>
            <span className="text-2xl font-bold text-primary">{products.length}</span>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearPedidoPage;