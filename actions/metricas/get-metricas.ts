'use server'

import { createClient } from '@/lib/supabase/server'

type EstadoPedido = 'pendiente' | 'en-proceso' | 'cancelado' | 'completado'

export interface TiempoEntregaMetricRow {
 nombre_repartidor: string | null
 min_mas_largo: number | null
 min_mas_corto: number | null
 min_promedio: number | null
 total_pedidos_completados: number | null
 user_id: string
}

export interface PedidosUsuarioTiempoRow {
 user_id: string
 pedidos_hoy: number | null
 pedidos_semana: number | null
 pedidos_mes: number | null
 pedidos_ano: number | null
 total_historico_usuario: number | null
}

export interface ResumenPedidosTotalesMensualRow {
 user_id: string
 pedido_id: string
 numero_pedido_incremental: number | null
 nombre_repartidor: string | null
 total_pedido: number | null
 estado: EstadoPedido
 fecha_creacion: string | null
}

export interface MetricasData {
 tiemposEntrega: TiempoEntregaMetricRow[]
 pedidosUsuarioTiempo: PedidosUsuarioTiempoRow | null
 valorPedidos: ResumenPedidosTotalesMensualRow[]
}

export async function getMetricasData(): Promise<{
 data: MetricasData | null
 error: string | null
}> {
 try {
 const supabase = await createClient()

 const {
 data: { user },
 } = await supabase.auth.getUser()

 if (!user) {
 return { data: null, error: 'No authenticated user' }
 }

 const [tiemposRes, pedidosUsuarioRes, valorPedidosRes] = await Promise.all([
 supabase
 .from('view_tiempos_entrega_por_repartidor')
 .select(
 'nombre_repartidor, min_mas_largo, min_mas_corto, min_promedio, total_pedidos_completados, user_id'
 )
 .eq('user_id', user.id)
 .order('nombre_repartidor', { ascending: true }),
 supabase
 .from('view_pedidos_por_usuario_tiempo')
 .select('user_id, pedidos_hoy, pedidos_semana, pedidos_mes, pedidos_ano, total_historico_usuario')
 .eq('user_id', user.id)
 .maybeSingle(),
 supabase
 .from('view_resumen_pedidos_totales_mensual')
 .select(
 'user_id, pedido_id, numero_pedido_incremental, nombre_repartidor, total_pedido, estado, fecha_creacion'
 )
 .eq('user_id', user.id)
 .eq('estado', 'completado')
 .order('fecha_creacion', { ascending: false }),
 ])

 if (tiemposRes.error) {
 return { data: null, error: tiemposRes.error.message }
 }

 if (pedidosUsuarioRes.error) {
 return { data: null, error: pedidosUsuarioRes.error.message }
 }

 if (valorPedidosRes.error) {
 return { data: null, error: valorPedidosRes.error.message }
 }

 return {
 data: {
 tiemposEntrega: (tiemposRes.data || []) as TiempoEntregaMetricRow[],
 pedidosUsuarioTiempo: (pedidosUsuarioRes.data || null) as PedidosUsuarioTiempoRow | null,
 valorPedidos: (valorPedidosRes.data || []) as ResumenPedidosTotalesMensualRow[],
 },
 error: null,
 }
 } catch (error) {
 console.error('Error fetching metricas data:', error)
 return { data: null, error: 'Failed to fetch metricas data' }
 }
}
