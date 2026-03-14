'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog'
import { getImageUrlWithTimestamp } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { getPedidoDetalle, type PedidoDetalle } from '@/actions/pedido/get-pedido-detalle'
import { updateEstadoPedido } from '@/actions/pedido/update-estado-pedido'

const estadoStyles: Record<PedidoDetalle['estado'], string> = {
 pendiente: 'bg-slate-500',
 'en-proceso': 'bg-amber-500',
 completado: 'bg-green-600',
 cancelado: 'bg-rose-600',
}

const estadoLabels: Record<PedidoDetalle['estado'], string> = {
 pendiente: 'Pendiente',
 'en-proceso': 'En proceso',
 completado: 'Completado',
 cancelado: 'Cancelado',
}

const DetallePedidoPage: React.FC = () => {
 const params = useParams<{ id: string }>()
 const pedidoId = params?.id ?? ''
 const { user } = useAuth()

 const [pedido, setPedido] = useState<PedidoDetalle | null>(null)
 const [loading, setLoading] = useState(true)
 const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
 const [isCancelling, setIsCancelling] = useState(false)

 useEffect(() => {
 let isMounted = true

 const fetchPedido = async () => {
 if (!pedidoId) {
 setLoading(false)
 return
 }

 setLoading(true)
 const { pedido: pedidoData, error } = await getPedidoDetalle(pedidoId)

 if (!isMounted) {
 return
 }

 if (error) {
 toast.error(error)
 setPedido(null)
 } else {
 setPedido(pedidoData)
 }

 setLoading(false)
 }

 fetchPedido()

 return () => {
 isMounted = false
 }
 }, [pedidoId])

 const total = useMemo(() => {
 if (!pedido) return 0
 return pedido.articulo.reduce((sum, articulo) => sum + articulo.cantidad * articulo.precio, 0)
 }, [pedido])

 const handleCancelPedido = async () => {
 if (!pedido || isCancelling || pedido.estado === 'cancelado') {
 return
 }

 setIsCancelling(true)

 try {
 const { error } = await updateEstadoPedido({
 pedidoId: pedido.id,
 estado: 'cancelado',
 })

 if (error) {
 toast.error(error)
 return
 }

 setPedido((prev) => (prev ? { ...prev, estado: 'cancelado' } : prev))
 toast.success('Pedido cancelado')
 setIsCancelModalOpen(false)
 } catch (error) {
 console.error('Error cancelling pedido:', error)
 toast.error('No se pudo cancelar el pedido')
 } finally {
 setIsCancelling(false)
 }
 }

 return (
 <div>
 <nav className='px-6 py-4 flex justify-between border-b'>
 <div className='text-xl font-extrabold tracking-tight flex items-center gap-3'>
 <LayoutGrid size={32} />
 Gestor Pedidos
 </div>
 {user && (
 <Link href='/profile'>
 <AvatarBadge
 name={user?.name || 'Usuario'}
 avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined}
 />
 </Link>
 )}
 </nav>

 <div className='container mx-auto p-6 max-w-4xl space-y-6'>
 <div className='space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3'>
 <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
 Detalle del pedido {pedido ? `#${pedido.id_pedido}` : ''}
 </h1>
 <div className='flex flex-col sm:flex-row gap-2'>
 <Button variant='outline' asChild>
 <Link href='/dashboard'>Volver al dashboard</Link>
 </Button>
 <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
 <DialogTrigger asChild>
 <Button
 type='button'
 className='bg-rose-600 hover:bg-rose-700 text-white'
 disabled={loading || !pedido || pedido.estado === 'cancelado' || pedido.estado === 'completado' || isCancelling}
 >
 {pedido?.estado === 'cancelado' ? 'Pedido cancelado' : 'Cancelar pedido'}
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Confirmar cancelacion</DialogTitle>
 <DialogDescription>
 Esta accion cambiara el estado del pedido a cancelado.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter>
 <Button
 type='button'
 variant='outline'
 onClick={() => setIsCancelModalOpen(false)}
 disabled={isCancelling}
 >
 Volver
 </Button>
 <Button
 type='button'
 className='bg-rose-600 hover:bg-rose-700 text-white'
 onClick={handleCancelPedido}
 disabled={isCancelling}
 >
 {isCancelling ? 'Cancelando...' : 'Confirmar cancelacion'}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 </div>

 {loading ? (
 <Card>
 <CardContent className='p-10 flex items-center justify-center'>
 <Loader2 className='h-7 w-7 animate-spin text-slate-400' />
 </CardContent>
 </Card>
 ) : !pedido ? (
 <Card>
 <CardContent className='p-6'>
 <p className='text-sm text-slate-600 dark:text-slate-400'>No se encontro este pedido.</p>
 </CardContent>
 </Card>
 ) : (
 <>
 <Card>
 <CardContent className='p-6'>
 <div className='mb-4 flex items-center gap-3'>
 <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Datos del pedido</h2>
 <span
 className={`${estadoStyles[pedido.estado]} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
 >
 {estadoLabels[pedido.estado]}
 </span>
 </div>
 <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Descripcion</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 {pedido.descripcion || 'Sin descripcion'}
 </p>
 </div>
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Direccion</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 {pedido.direccion || 'Sin direccion'}
 </p>
 </div>
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Repartidor</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 {pedido.repartidor
 ? [pedido.repartidor.nombre, pedido.repartidor.apellido].filter(Boolean).join(' ')
 : 'Sin repartidor'}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className='p-6'>
 <h2 className='text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100'>
 Resumen de articulos
 </h2>

 {pedido.articulo.length === 0 ? (
 <p className='text-sm text-slate-600 dark:text-slate-400'>
 Este pedido no tiene articulos registrados.
 </p>
 ) : (
 <div className='space-y-4'>
 {pedido.articulo.map((articulo) => (
 <div
 key={articulo.id}
 className='grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-4'
 >
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Descripcion</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 {articulo.descripcion}
 </p>
 </div>
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Cantidad</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 {articulo.cantidad}
 </p>
 </div>
 <div>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Precio</p>
 <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
 ${articulo.precio.toFixed(2)}
 </p>
 </div>
 </div>
 ))}

 <div className='flex justify-between items-center pt-2'>
 <span className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
 Cantidad de articulos: {pedido.articulo.length}
 </span>
 <span className='text-lg font-bold text-primary'>Total: ${total.toFixed(2)}</span>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </>
 )}
 </div>
 </div>
 )
}

export default DetallePedidoPage
