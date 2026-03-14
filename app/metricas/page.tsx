'use client'

import Link from 'next/link'
import { LayoutGrid, Clock3, Truck, ReceiptText } from 'lucide-react'

import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { getImageUrlWithTimestamp } from '@/lib/utils'

type TiempoEntregaMetrica = {
 repartidor: string
 masLargo: string
 masCorto: string
 promedioTotalPedidos: string
}

type PedidosEntregadosMetrica = {
 repartidor: string
 hoy: number
 estaSemana: number
 esteMes: number
 totalHistorico: number
}

type ValorPedidoMetrica = {
 pedidoNumero: number
 nombreRepartidor: string
 totalPedido: string
 fechaCreacion: string
}

const tiemposEntrega: TiempoEntregaMetrica[] = [
 {
 repartidor: 'Carlos Pena',
 masLargo: '1h 35m',
 masCorto: '18m',
 promedioTotalPedidos: '42m',
 },
 {
 repartidor: 'Maria Diaz',
 masLargo: '1h 08m',
 masCorto: '15m',
 promedioTotalPedidos: '37m',
 },
 {
 repartidor: 'Jose Ramirez',
 masLargo: '1h 20m',
 masCorto: '20m',
 promedioTotalPedidos: '45m',
 },
]

const pedidosEntregados: PedidosEntregadosMetrica[] = [
 {
 repartidor: 'Carlos Pena',
 hoy: 6,
 estaSemana: 34,
 esteMes: 128,
 totalHistorico: 842,
 },
 {
 repartidor: 'Maria Diaz',
 hoy: 8,
 estaSemana: 39,
 esteMes: 141,
 totalHistorico: 901,
 },
 {
 repartidor: 'Jose Ramirez',
 hoy: 5,
 estaSemana: 29,
 esteMes: 117,
 totalHistorico: 770,
 },
]

const valorPedidos: ValorPedidoMetrica[] = [
 {
 pedidoNumero: 1043,
 nombreRepartidor: 'Carlos Pena',
 totalPedido: '$48.50',
 fechaCreacion: '14 Mar 2026, 09:15 AM',
 },
 {
 pedidoNumero: 1044,
 nombreRepartidor: 'Maria Diaz',
 totalPedido: '$62.00',
 fechaCreacion: '14 Mar 2026, 10:42 AM',
 },
 {
 pedidoNumero: 1045,
 nombreRepartidor: 'Jose Ramirez',
 totalPedido: '$37.75',
 fechaCreacion: '14 Mar 2026, 11:08 AM',
 },
]

export default function MetricasPage() {
 const { user } = useAuth()
 const valorTotalPedidos = valorPedidos.reduce((acc, item) => {
 const amount = Number(item.totalPedido.replace('$', ''))
 return acc + (Number.isFinite(amount) ? amount : 0)
 }, 0)

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
 {tiemposEntrega.map((item) => (
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
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 <div className='space-y-4'>
 <div className='flex items-center gap-2'>
 <Truck className='h-4 w-4 text-primary' />
 <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Pedidos entregados</h2>
 </div>

 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
 {pedidosEntregados.map((item) => (
 <Card key={item.repartidor} className='overflow-hidden'>
 <CardContent className='p-6 space-y-4'>
 <div className='flex items-center justify-between'>
 <p className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400'>Repartidor</p>
 <span className='text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>Entregas</span>
 </div>

 <p className='text-lg font-bold text-slate-900 dark:text-slate-100'>{item.repartidor}</p>

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
 <p className='text-xs text-slate-500 dark:text-slate-400'>Total historico</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.totalHistorico}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
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
 Valor total: <span className='text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>${valorTotalPedidos.toFixed(2)}</span>
 </p>

 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
 {valorPedidos.map((item) => (
 <Card key={item.pedidoNumero} className='overflow-hidden'>
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
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.totalPedido}</p>
 </div>

 <div className='rounded-md border p-3'>
 <p className='text-xs text-slate-500 dark:text-slate-400'>Fecha de creacion</p>
 <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{item.fechaCreacion}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </section>
 </main>
 </div>
 )
}
