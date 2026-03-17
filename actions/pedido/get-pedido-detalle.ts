'use server'

import { createClient } from '@/lib/supabase/server'

interface Repartidor {
 id: string
 nombre: string | null
 apellido: string | null
}

interface ArticuloPedido {
 id: string
 descripcion: string
 cantidad: number
 precio: number
}

type PedidoDetalleRow = {
 id: string
 id_pedido: number
 descripcion: string | null
 direccion: string | null
 estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado'
 repartidor: Repartidor | Repartidor[] | null
 articulo: ArticuloPedido[] | null
}

export interface PedidoDetalle {
 id: string
 id_pedido: number
 descripcion: string | null
 direccion: string | null
 estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado'
 repartidor: Repartidor | null
 articulo: ArticuloPedido[]
}

function normalizeRepartidor(repartidor: Repartidor | Repartidor[] | null): Repartidor | null {
 if (!repartidor) return null
 return Array.isArray(repartidor) ? (repartidor[0] || null) : repartidor
}

export async function getPedidoDetalle(pedidoId: string) {
 try {
 if (!pedidoId?.trim()) {
 return { pedido: null, error: 'Pedido invalido' }
 }

 const supabase = await createClient()

 const {
 data: { user },
 } = await supabase.auth.getUser()

 if (!user) {
 return { pedido: null, error: 'No authenticated user' }
 }

 const { data, error } = await supabase
 .from('pedido')
 .select(
 `
 id,
 id_pedido,
 descripcion,
 direccion,
 estado,
 repartidor (id, nombre, apellido),
 articulo (id, descripcion, cantidad, precio)
 `
 )
 .eq('id', pedidoId)
 .eq('user_id', user.id)
 .single()

 if (error) {
 return { pedido: null, error: error.message }
 }

 const row = data as PedidoDetalleRow

 return {
 pedido: {
 ...row,
 repartidor: normalizeRepartidor(row.repartidor),
 articulo: row.articulo || [],
 },
 error: null,
 }
 } catch (error) {
 console.error('Error fetching pedido detail:', error)
 return { pedido: null, error: 'Failed to fetch pedido detail' }
 }
}
