'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import toast from 'react-hot-toast';
import { createPedido } from '@/actions/pedido/create-pedido';
import { getRepartidores, RepartidorOption } from '@/actions/repartidor/get-repartidores';

interface Articulo {
  descripcion: string;
  cantidad: number;
  precio: number;
}

const DatosClientePage: React.FC = () => {
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [repartidorId, setRepartidorId] = useState('');
  const [repartidores, setRepartidores] = useState<RepartidorOption[]>([]);
  const [loadingRepartidores, setLoadingRepartidores] = useState(true);
  const [savingPedido, setSavingPedido] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articulos] = useState<Articulo[]>(() => {
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
      return [];
    }
  });
  const router = useRouter();

  const total = useMemo(
    () => articulos.reduce((sum, articulo) => sum + articulo.cantidad * articulo.precio, 0),
    [articulos]
  );

  const repartidorSeleccionado = useMemo(
    () => repartidores.find((repartidor) => repartidor.id === repartidorId),
    [repartidorId, repartidores]
  );

  const hasAllFormData =
    descripcion.trim().length > 0 &&
    direccion.trim().length > 0 &&
    repartidorId.trim().length > 0 &&
    articulos.length > 0;

  useEffect(() => {
    let isMounted = true;

    const fetchRepartidores = async () => {
      setLoadingRepartidores(true);
      const { repartidores: repartidoresData, error } = await getRepartidores();

      if (!isMounted) {
        return;
      }

      if (error) {
        toast.error(error);
        setRepartidores([]);
      } else {
        setRepartidores(repartidoresData);
      }

      setLoadingRepartidores(false);
    };

    fetchRepartidores();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasAllFormData) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleSavePedido = async () => {
    if (!hasAllFormData || savingPedido) {
      return;
    }

    setSavingPedido(true);

    try {
      const { pedido, error } = await createPedido({
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
        repartidorId,
        articulos: articulos.map((articulo) => ({
          descripcion: articulo.descripcion.trim(),
          cantidad: Number(articulo.cantidad),
          precio: Number(articulo.precio),
        })),
      });

      if (error) {
        toast.error(error);
        return;
      }

      sessionStorage.removeItem('pedidoArticulos');
      sessionStorage.removeItem('pedidoProducts');
      toast.success(`Pedido #${pedido?.id_pedido ?? ''} creado exitosamente`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating pedido:', error);
      toast.error('Error al crear el pedido');
    } finally {
      setSavingPedido(false);
    }
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
                <DialogDescription>Completa descripcion, direccion y repartidor.</DialogDescription>
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
                    Repartidor
                  </label>
                  <Select value={repartidorId} onValueChange={setRepartidorId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingRepartidores
                            ? 'Cargando repartidores...'
                            : 'Selecciona un repartidor'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {repartidores.map((repartidor) => (
                        <SelectItem key={repartidor.id} value={repartidor.id}>
                          {[repartidor.nombre, repartidor.apellido].filter(Boolean).join(' ')}
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Repartidor</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {repartidorSeleccionado
                  ? [repartidorSeleccionado.nombre, repartidorSeleccionado.apellido]
                      .filter(Boolean)
                      .join(' ')
                  : 'Sin repartidor'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Resumen de articulos
          </h2>

          {articulos.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay articulos cargados desde Crear Pedido.
            </p>
          ) : (
            <div className="space-y-4">
              {articulos.map((articulo, index) => (
                <div
                  key={`${articulo.descripcion}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-4"
                >
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Descripcion</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {articulo.descripcion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cantidad</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {articulo.cantidad}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Precio</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      ${articulo.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Cantidad de articulos: {articulos.length}
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
          onClick={handleSavePedido}
          disabled={!hasAllFormData || savingPedido}
          className="bg-blue-500 text-white hover:bg-blue-500/90 w-full sm:w-auto"
        >
          {savingPedido ? 'Guardando...' : 'Listo'}
        </Button>
      </div>
    </div>
    
    </div>
  );
};

export default DatosClientePage;
