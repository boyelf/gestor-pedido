'use server'

import { createClient } from '@/lib/supabase/server'
import type { EstadoPedido } from './get-pedidos'

interface UpdateEstadoPedidoParams {
    pedidoId: string
    estado: EstadoPedido
}

export async function updateEstadoPedido({ pedidoId, estado }: UpdateEstadoPedidoParams) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { pedido: null, error: 'No authenticated user' }
        }

        const shouldSetFechaTerminacion = estado === 'completado' || estado === 'cancelado'
        const shouldSetFechaInicioEntrega = estado === 'en-proceso'

        const { data, error } = await supabase
            .from('pedido')
            .update([
                {
                    estado,
                    fecha_inicio_entrega: shouldSetFechaInicioEntrega ? new Date().toISOString() : undefined,
                    fecha_terminacion: shouldSetFechaTerminacion ? new Date().toISOString() : null,
                },
            ])
            .eq('id', pedidoId)
            .eq('user_id', user.id)
            .select('id, estado, fecha_terminacion, fecha_inicio_entrega')
            .single()

        if (error) {
            return { pedido: null, error: error.message }
        }

        return { pedido: data, error: null }
    } catch (error) {
        console.error('Error updating pedido estado:', error)
        return { pedido: null, error: 'Failed to update pedido estado' }
    }
}
