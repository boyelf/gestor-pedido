'use server'

import { createClient } from '@/lib/supabase/server'

export interface RepartidorOption {
  id: string
  nombre: string | null
  apellido: string | null
}

export async function getRepartidores() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { repartidores: [], error: 'No authenticated user' }
    }

    const { data, error } = await supabase
      .from('repartidor')
      .select('id, nombre, apellido')
      .eq('user_id', user.id)
      .order('nombre', { ascending: true })

    if (error) {
      return { repartidores: [], error: error.message }
    }

    return { repartidores: (data ?? []) as RepartidorOption[], error: null }
  } catch (error) {
    console.error('Error fetching repartidores:', error)
    return { repartidores: [], error: 'Failed to fetch repartidores' }
  }
}
