'use server'

import { createClient } from '@/lib/supabase/server'

export type EstadoPedido = 'pendiente' | 'en-proceso' | 'completado' | 'cancelado'

export interface Pedido {
  id: string
  id_pedido: number
  descripcion: string | null
  direccion: string | null
  estado: EstadoPedido
  fecha_creacion: string | null
  repartidor: repartidor | null
}

interface repartidor {
  id: string
  nombre: string
  apellido: string
}

interface GetPedidosParams {
  page?: number
  pageSize?: number
  estado?: 'all' | EstadoPedido
  search?: string
}

export async function getPedidos({
 page = 0,
 pageSize = 10,
 estado = 'all',
 search = '',
}: GetPedidosParams) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { pedidos: [], total: 0, error: 'No authenticated user' }
    }

    let query = supabase
      .from('pedido')
      .select('id, id_pedido, descripcion, direccion, estado, fecha_creacion, repartidor (id, nombre, apellido)',
       { count: 'exact' })
      .eq('user_id', user.id)
      .order('fecha_creacion', { ascending: false })

    if (estado !== 'all') {
      query = query.eq('estado', estado)
    }

    const normalizedSearch = search.trim()
    if (normalizedSearch) {
      const isNumericIdSearch = /^\d+$/.test(normalizedSearch)

      if (isNumericIdSearch) {
        query = query.or(
          `direccion.ilike.%${normalizedSearch}%,id_pedido.eq.${Number(normalizedSearch)}`
        )
      } else {
        query = query.ilike('direccion', `%${normalizedSearch}%`)
      }
    }

    const offset = page * pageSize
    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      return { pedidos: [], total: 0, error: error.message }
    }

    return {
      pedidos: (data as Pedido[]) || [],
      total: count || 0,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching pedidos:', error)
    return { pedidos: [], total: 0, error: 'Failed to fetch pedidos' }
  }
}
