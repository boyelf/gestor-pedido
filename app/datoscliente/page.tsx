'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getImageUrlWithTimestamp } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { useAuth } from '@/context/AuthContext';

interface Product {
  descripcion: string;
  cantidad: number;
  precio: number;
}

const mensajeros = ['Carlos', 'Mariana', 'Diego', 'Ana'];

const DatosClientePage: React.FC = () => {
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mensajero, setMensajero] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products] = useState<Product[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const storedProducts = sessionStorage.getItem('pedidoProducts');
    if (!storedProducts) {
      return [];
    }

    try {
      return JSON.parse(storedProducts) as Product[];
    } catch {
      return [];
    }
  });

  const total = useMemo(
    () => products.reduce((sum, product) => sum + product.cantidad * product.precio, 0),
    [products]
  );
  const hasAllFormData =
    descripcion.trim().length > 0 && direccion.trim().length > 0 && mensajero.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasAllFormData) {
      return;
    }
    setIsModalOpen(false);
  };

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
    
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Datos del cliente</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="outline">
            <Link href="/crearpedido">Volver a crear pedido</Link>
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>Editar datos del cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Formulario del cliente</DialogTitle>
                <DialogDescription>Completa descripcion, direccion y mensajero.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Descripcion
                  </label>
                  <Input
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripcion del pedido"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Direccion
                  </label>
                  <Input
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Direccion de entrega"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mensajero
                  </label>
                  <Select value={mensajero} onValueChange={setMensajero}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un mensajero" />
                    </SelectTrigger>
                    <SelectContent>
                      {mensajeros.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={!hasAllFormData}>
                    Guardar datos
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Datos proporcionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Descripcion</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {descripcion || 'Sin descripcion'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direccion</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {direccion || 'Sin direccion'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mensajero</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {mensajero || 'Sin mensajero'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Resumen de productos
          </h2>

          {products.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay productos cargados desde Crear Pedido.
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={`${product.descripcion}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-4"
                >
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Descripcion</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {product.descripcion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cantidad</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {product.cantidad}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Precio</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      ${product.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Cantidad de articulos: {products.length}
                </span>
                <span className="text-lg font-bold text-primary">Total: ${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-stretch sm:justify-end">
        <Button
          type="button"
          disabled={!hasAllFormData}
          className="bg-blue-500 text-white hover:bg-blue-500/90 w-full sm:w-auto"
        >
          Listo
        </Button>
      </div>
    </div>
    
    </div>
  );
};

export default DatosClientePage;
