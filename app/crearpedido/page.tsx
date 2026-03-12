'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, LayoutGrid } from 'lucide-react';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { useAuth } from '@/context/AuthContext';
import { getImageUrlWithTimestamp } from '@/lib/utils';

interface Articulo {
  descripcion: string;
  cantidad: number;
  precio: number;
}

const CrearPedidoPage: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const storedArticulos =
      sessionStorage.getItem('pedidoArticulos') ?? sessionStorage.getItem('pedidoProducts');
    if (!storedArticulos) {
      return [];
    }

    try {
      return JSON.parse(storedArticulos) as Articulo[];
    } catch {
      sessionStorage.removeItem('pedidoArticulos');
      sessionStorage.removeItem('pedidoProducts');
      return [];
    }
  });
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(1);

  useEffect(() => {
    sessionStorage.setItem('pedidoArticulos', JSON.stringify(articulos));
  }, [articulos]);

  const addArticulo = () => {
    if (descripcion.trim() && cantidad > 0 && precio >= 0) {
      setArticulos([...articulos, { descripcion, cantidad, precio }]);
      setDescripcion('');
      setCantidad(1);
      setPrecio(1);
    }
  };

  const deleteArticulo = (index: number) => {
    setArticulos(articulos.filter((_, i) => i !== index));
  };

  const total = articulos.reduce((sum, articulo) => sum + articulo.cantidad * articulo.precio, 0);

const { user } = useAuth();

  return (
    
        <div>
    <nav className="px-6 py-4 flex justify-between border-b">
        <div className="text-xl font-extrabold tracking-tight flex items-center gap-3" >
            <LayoutGrid size={32}/>
           Gestor Pedidos
        </div>
        {user && (
        
        <Link href="/profile" >
           <AvatarBadge name={user?.name || "Usuario"} avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined} />
        </Link>
        
        )}
        
    </nav>
    
        <div className="container mx-auto p-6 pb-24 md:pb-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Crear Pedido</h1>

      {/* Add Product Form */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Agregar Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripcion</label>
              <Input
                placeholder="Descripcion del producto"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cantidad (unidades)
              </label>
              <Input
                type="text"
                placeholder="Ej: 2"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Precio (por unidad)
              </label>
              <Input
                type="text"
                placeholder="Ej: 10.50"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
              />
            </div>
          </div>
          <Button onClick={addArticulo} className="mt-4 flex items-center gap-2">
            <Plus size={16} />
            Agregar Producto
          </Button>
        </CardContent>
      </Card>

      {/* Product List */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-md font-medium text-slate-700 dark:text-slate-300">
            Cantidad de articulos: {articulos.length}
          </label>
        </div>
        {articulos.map((articulo, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripcion</label>
                    <p className="text-slate-900 dark:text-slate-100">{articulo.descripcion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label>
                    <p className="text-slate-900 dark:text-slate-100">{articulo.cantidad}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Precio</label>
                    <p className="text-slate-900 dark:text-slate-100">${articulo.precio.toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteArticulo(index)}
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
            <span className="text-2xl font-bold text-primary">{articulos.length}</span>
          </div> */}
          <div className="mt-6 hidden md:flex md:justify-end">
            {articulos.length === 0 ? (
              <Button type="button" disabled>
                Continuar a datos del cliente
              </Button>
            ) : (
              <Button asChild>
                <Link href="/datoscliente">Continuar a datos del cliente</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto max-w-4xl">
          {articulos.length === 0 ? (
            <Button type="button" disabled className="w-full">
              Continuar a datos del cliente
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/datoscliente">Continuar a datos del cliente</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default CrearPedidoPage;
