'use server'

import { createClient } from '@/lib/supabase/server'
import { Task, Status } from '@/app/dashboard/components/TaskForm'

interface GetTasksParams {
  page: number
  pageSize?: number
  status?: string
  priority?: string
  search?: string
}

export async function getTasks({
  page = 0,
  pageSize = 10,
  status = 'all',
  priority = 'all',
  search = '',
}: GetTasksParams) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { tasks: [], total: 0, error: 'No authenticated user' }
    }

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Apply pagination
    const offset = page * pageSize
    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      return { tasks: [], total: 0, error: error.message }
    }

    return {
      tasks: (data as Task[]) || [],
      total: count || 0,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { tasks: [], total: 0, error: 'Failed to fetch tasks' }
  }
}

export async function getTaskById(taskId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { task: null, error: 'No authenticated user' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { task: null, error: error.message }
    }

    return { task: data as Task, error: null }
  } catch (error) {
    console.error('Error fetching task:', error)
    return { task: null, error: 'Failed to fetch task' }
  }
}
