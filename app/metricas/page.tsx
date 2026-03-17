'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, Clock3, Truck, ReceiptText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { getImageUrlWithTimestamp } from '@/lib/utils'
import { getMetricasData } from '@/actions/metricas/get-metricas'

type TiempoEntregaMetrica = {
 repartidor: string
 masLargo: string
 masCorto: string
 promedioTotalPedidos: string
 pedidosCompletados: number
}

type PedidosEntregadosMetrica = {
 usuario: string
 hoy: number
 estaSemana: number
 esteMes: number
 esteAno: number
 totalHistorico: number
}

type ValorPedidoMetrica = {
 pedidoId: string
 pedidoNumero: number
 nombreRepartidor: string
 totalPedido: number
 fechaCreacion: string
}

function formatMinutes(value: number | null | undefined): string {
 if (value == null || !Number.isFinite(value)) return '0m'

 const rounded = Math.round(value)
 const hours = Math.floor(rounded / 60)
 const minutes = rounded % 60

 if (hours <= 0) return `${minutes}m`
 if (minutes === 0) return `${hours}h`
 return `${hours}h ${minutes}m`
}

function formatCurrency(value: number): string {
 return `${value.toLocaleString('en-US', { style: 'currency', currency: 'DOP' })}`
}

function formatDateTime(value: string): string {
 const date = new Date(value)
 if (Number.isNaN(date.getTime())) return '-'

 return new Intl.DateTimeFormat('es-BO', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 }).format(date)
}

export default function MetricasPage() {
 const { user } = useAuth()
 const [loading, setLoading] = useState(true)
 const [tiemposEntrega, setTiemposEntrega] = useState<TiempoEntregaMetrica[]>([])
 const [pedidosEntregados, setPedidosEntregados] = useState<PedidosEntregadosMetrica[]>([])
 const [valorPedidos, setValorPedidos] = useState<ValorPedidoMetrica[]>([])

 useEffect(() => {
 let isMounted = true

 const loadMetricas = async () => {
 setLoading(true)
 const { data, error } = await getMetricasData()

 if (!isMounted) {
 return
 }

 if (error || !data) {
 toast.error(error || 'No se pudo cargar metricas')
 setTiemposEntrega([])
 setPedidosEntregados([])
 setValorPedidos([])
 setLoading(false)
 return
 }

 setTiemposEntrega(
 data.tiemposEntrega.map((item) => ({
 repartidor: item.nombre_repartidor || 'Sin nombre',
 masLargo: formatMinutes(item.min_mas_largo),
 masCorto: formatMinutes(item.min_mas_corto),
 promedioTotalPedidos: formatMinutes(item.min_promedio),
 pedidosCompletados: item.total_pedidos_completados || 0,
 }))
 )

 if (data.pedidosUsuarioTiempo) {
 setPedidosEntregados([
 {
 usuario: 'Tu empresa',
 hoy: data.pedidosUsuarioTiempo.pedidos_hoy || 0,
 estaSemana: data.pedidosUsuarioTiempo.pedidos_semana || 0,
 esteMes: data.pedidosUsuarioTiempo.pedidos_mes || 0,
 esteAno: data.pedidosUsuarioTiempo.pedidos_ano || 0,
 totalHistorico: data.pedidosUsuarioTiempo.total_historico_usuario || 0,
 },
 ])
 } else {
 setPedidosEntregados([])
 }

 setValorPedidos(
 data.valorPedidos.map((item) => ({
 pedidoId: item.pedido_id,
 pedidoNumero: item.numero_pedido_incremental || 0,
 nombreRepartidor: item.nombre_repartidor || 'Sin repartidor',
 totalPedido: item.total_pedido || 0,
 fechaCreacion: item.fecha_creacion ? formatDateTime(item.fecha_creacion) : '-',
 }))
 )

 setLoading(false)
 }

 loadMetricas()

 return () => {
 isMounted = false
 }
 }, [])

 const valorTotalPedidos = useMemo(() => {
 return valorPedidos.reduce((acc, item) => acc + item.totalPedido, 0)
 }, [valorPedidos])

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

 <main className='space-y-10 py-8 px-6'>
 {loading ? (
 <Card>
 <CardContent className='p-10 flex items-center justify-center'>
 <Loader2 className='h-7 w-7 animate-spin text-slate-400' />
 </CardContent>
 </Card>
 ) : (
 <>
 <section className='space-y-6'>
 <div className='space-y-1'>
 <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>Pedidos</h1>
 <p className='text-sm text-slate-500 dark:text-slate-400'>Metricas operativas por repartidor</p>
 </div>

 <div className='space-y-4'>
 <div className='flex items-center gap-2'>
 <Clock3 className='h-4 w-4 text-primary' />
 <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Tiempo de entrega de pedidos</h2>
 </div>

 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
 {tiemposEntrega.length === 0 ? (
 <Card className='md:col-span-2 xl:col-span-3'>
 <CardContent className='p-6'>
 <p className='text-sm text-slate-500 dark:text-slate-400'>
 No hay tiempos de entrega disponibles.
 </p>
 </CardContent>
 </Card>
 ) : (
 tiemposEntrega.map((item) => (
 <Card key={item.repartidor} className='overflow-hidden'>
 <CardContent className='p-6 space-y-4'>
 <div className='flex items-center justify-between'>
 <p className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400'>Repartidor</p>
 <span className='text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary'>Tiempo</span>
 </div>

 <p className='text-lg font-bold text-slate-900 dark:text-slate-100'>{item.repartidor}</p>

 <div className='grid grid-cols-2 gap-3'>
 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Mas largo</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.masLargo}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Mas corto</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.masCorto}</p>
 </div>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Promedio total de pedidos</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.promedioTotalPedidos}</p>
 </div>
 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Pedidos completados</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.pedidosCompletados}</p>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>

 <div className='space-y-4'>
 <div className='flex items-center gap-2'>
 <Truck className='h-4 w-4 text-primary' />
 <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Pedidos entregados</h2>
 </div>

 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
 {pedidosEntregados.length === 0 ? (
 <Card className='md:col-span-2 xl:col-span-3'>
 <CardContent className='p-6'>
 <p className='text-sm text-slate-500 dark:text-slate-400'>
 No hay metricas de pedidos entregados.
 </p>
 </CardContent>
 </Card>
 ) : (
 pedidosEntregados.map((item) => (
 <Card key={item.usuario} className='overflow-hidden'>
 <CardContent className='p-6 space-y-4'>
 <div className='flex items-center justify-between'>
 <p className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400'>Usuario</p>
 <span className='text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>Entregas</span>
 </div>

 <p className='text-lg font-bold text-slate-900 dark:text-slate-100'>{item.usuario}</p>

 <div className='grid grid-cols-2 gap-3'>
 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Hoy</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.hoy}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Esta semana</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.estaSemana}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Este mes</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.esteMes}</p>
 </div>
 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Este año</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.esteAno}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Total historico</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.totalHistorico}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 </section>

 <section className='space-y-6'>
 <div className='space-y-1'>
 <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>Ventas</h1>
 <p className='text-sm text-slate-500 dark:text-slate-400'>Resumen de ingresos por pedido</p>
 </div>

 <div className='space-y-4'>
 <div className='flex items-center gap-2'>
 <ReceiptText className='h-4 w-4 text-primary' />
 <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Valor de los pedidos</h2>
 </div>
 <p className='text-sm text-slate-500 dark:text-slate-400'>
 Valor total: <span className='text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>{formatCurrency(valorTotalPedidos)}</span>
 </p>

 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
 {valorPedidos.length === 0 ? (
 <Card className='md:col-span-2 xl:col-span-3'>
 <CardContent className='p-6'>
 <p className='text-sm text-slate-500 dark:text-slate-400'>No hay pedidos para mostrar.</p>
 </CardContent>
 </Card>
 ) : (
 valorPedidos.map((item) => (
 <Card key={item.pedidoId} className='overflow-hidden'>
 <CardContent className='p-6 space-y-4'>
 <div className='flex items-center justify-between'>
 <p className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400'>#Pedido</p>
 <span className='text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>Ventas</span>
 </div>

 <p className='text-lg font-bold text-slate-900 dark:text-slate-100'>#{item.pedidoNumero}</p>

 <div className='space-y-3'>
 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Nombre repartidor</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.nombreRepartidor}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Total pedido</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
 {formatCurrency(item.totalPedido)}
 </p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Fecha de creacion</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.fechaCreacion}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 </section>
 </>
 )}
 </main>
 </div>
 )
}

