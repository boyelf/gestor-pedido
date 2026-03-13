'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Check, Settings, Trophy, User2, CircleDashed } from 'lucide-react'
import type { EstadoPedido, Pedido } from '@/actions/pedido/get-pedidos'
import { updateEstadoPedido } from '@/actions/pedido/update-estado-pedido'
import toast from 'react-hot-toast'

interface TarjetaPedidoProps {
  pedido: Pedido
  onEstadoUpdated: (pedidoId: string, estado: EstadoPedido) => void
}

const estadoStyles: Record<EstadoPedido, string> = {
  pendiente: 'bg-slate-500',
  'en-proceso': 'bg-amber-500',
  completado: 'bg-green-600',
  cancelado: 'bg-rose-600',
}

const estadoLabels: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  'en-proceso': 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

function formatFecha(value: string | null) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return date.toLocaleString('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const TarjetaPedido: React.FC<TarjetaPedidoProps> = ({ pedido, onEstadoUpdated }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const nextEstado: EstadoPedido | null =
    pedido.estado === 'pendiente'
      ? 'en-proceso'
      : pedido.estado === 'en-proceso'
        ? 'completado'
        : null

  const actionLabel =
    pedido.estado === 'en-proceso'
      ? 'Terminar'
      : pedido.estado === 'completado'
        ? 'Completado'
        : pedido.estado === 'cancelado'
          ? 'Cancelado'
          : 'Iniciar'

  const handleAccionPedido = async () => {
    if (!nextEstado || isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await updateEstadoPedido({
        pedidoId: pedido.id,
        estado: nextEstado,
      })

      if (error) {
        toast.error(error)
        return
      }

      onEstadoUpdated(pedido.id, nextEstado)
      toast.success('Estado actualizado')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="max-w-md w-full overflow-hidden">
      <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/food-delivery-symbol-logo.png')" }}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`${estadoStyles[pedido.estado]} text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm`}
          >
            {estadoLabels[pedido.estado]}
          </span>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">
              Pedido #{pedido.id_pedido}
            </h2>
            <div className="flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-md">
                <User2 size={20} />
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Carlos Rodriguez
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {pedido.direccion || 'Sin direccion'}
            </p>

            <div className="mt-4 space-y-0 relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-yellow-400 dark:bg-slate-800"></div>

              <div className="relative flex gap-4 pb-6">
                <div className="z-10 bg-white dark:bg-slate-900 rounded-full h-6 w-6 flex items-center justify-center border-2 border-primary">
                  <span className="material-symbols-outlined text-primary text-[14px] font-bold">
                    <Check />
                  </span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Pedido Creado</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {formatFecha(pedido.fecha_creacion)}
                  </p>
                </div>
              </div>

              <div className="relative flex gap-4 pb-6">
                <div className="z-10 bg-white dark:bg-slate-900 rounded-full h-6 w-6 flex items-center justify-center border-2 border-primary">
                  {pedido.estado === 'en-proceso' || pedido.estado === 'completado' ? (
                    <span className="material-symbols-outlined text-primary text-[14px] font-bold">
                      <Check />
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-slate-500 text-[14px] font-bold">
                      <CircleDashed />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Inicio de Entrega</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {pedido.estado === 'pendiente' ? 'Pendiente' : 'En proceso'}
                  </p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="z-10 bg-slate-100 dark:bg-slate-800 rounded-full h-6 w-6 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                  {pedido.estado === 'completado' ? (
                    <span className="material-symbols-outlined text-green-500 text-[14px] font-bold">
                      <Trophy />
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-slate-500 text-[14px] font-bold">
                      <CircleDashed />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Entrega terminada</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {pedido.estado === 'completado' ? 'Completado' : 'Sin completar'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Settings className="text-primary" size={18} />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <BookOpen size={16} />
            Detalles
          </button>
          <button
            id="accion-pedido"
            onClick={handleAccionPedido}
            disabled={!nextEstado || isUpdating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 rounded-lg transition-colors"
          >
            {isUpdating ? 'Actualizando...' : actionLabel}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TarjetaPedido
