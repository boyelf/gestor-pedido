'use server'

import { createClient } from '@/lib/supabase/server'

interface ArticuloInput {
  descripcion: string
  cantidad: number
  precio: number
}

interface CreatePedidoData {
  descripcion: string
  direccion: string
  repartidorId: string
  articulos: ArticuloInput[]
}

export async function createPedido(data: CreatePedidoData) {
  try {
    const descripcion = data.descripcion.trim()
    const direccion = data.direccion.trim()

    const articulosPayload = data.articulos
      .map((articulo) => ({
        descripcion: articulo.descripcion.trim(),
        cantidad: Number(articulo.cantidad),
        precio: Number(articulo.precio),
      }))
      .filter(
        (articulo) =>
          articulo.descripcion.length > 0 &&
          Number.isFinite(articulo.cantidad) &&
          Number.isFinite(articulo.precio) &&
          articulo.cantidad > 0 &&
          articulo.precio >= 0
      )

    if (!descripcion || !direccion || !data.repartidorId || articulosPayload.length === 0) {
      return { pedido: null, error: 'Missing pedido data' }
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { pedido: null, error: 'No authenticated user' }
    }

    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedido')
      .insert([
        {
          descripcion,
          direccion,
          repartidor_id: data.repartidorId,
          user_id: user.id,
        },
      ])
      .select('id, id_pedido')
      .single()

    if (pedidoError || !pedidoData) {
      return { pedido: null, error: pedidoError?.message ?? 'Failed to create pedido' }
    }

    const articulosWithPedidoId = articulosPayload.map((articulo) => ({
      ...articulo,
      pedido_id: pedidoData.id,
      user_id: user.id,
    }))

    if (articulosWithPedidoId.length > 0) {
      const { error: articulosError } = await supabase.from('articulo').insert(articulosWithPedidoId)

      if (articulosError) {
        await supabase.from('pedido').delete().eq('id', pedidoData.id).eq('user_id', user.id)
        return { pedido: null, error: articulosError.message }
      }
    }

    return { pedido: pedidoData, error: null }
  } catch (error) {
    console.error('Error creating pedido:', error)
    return { pedido: null, error: 'Failed to create pedido' }
  }
}
