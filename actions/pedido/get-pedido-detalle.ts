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

export interface PedidoDetalle {
 id: string
 id_pedido: number
 descripcion: string | null
 direccion: string | null
 estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado'
 repartidor: Repartidor | null
 articulo: ArticuloPedido[]
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

 return { pedido: data as PedidoDetalle, error: null }
 } catch (error) {
 console.error('Error fetching pedido detail:', error)
 return { pedido: null, error: 'Failed to fetch pedido detail' }
 }
}
