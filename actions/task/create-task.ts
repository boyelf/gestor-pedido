'use server'

import { createClient } from '@/lib/supabase/server'
import { Task, Status } from '@/app/dashboard/components/TaskForm'

interface CreateTaskData {
  title: string
  description?: string
  status?: Status
  priority?: 'low' | 'medium' | 'high'
  image?: File | null
}

export async function createTask(data: CreateTaskData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { task: null, error: 'No authenticated user' }
    }

    let imageUrl = null

    // Upload image if provided
    if (data.image) {
      const fileExt = data.image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const arrayBuffer = await data.image.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(fileName, uint8Array, {
          contentType: data.image.type,
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
      } else {
        const { data: publicData } = supabase.storage
          .from('task-images')
          .getPublicUrl(fileName)
        imageUrl = publicData?.publicUrl || null
      }
    }

    // Create task
    const { data: taskData, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: data.title,
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          user_id: user.id,
          image: imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      return { task: null, error: error.message }
    }

    return { task: taskData as Task, error: null }
  } catch (error) {
    console.error('Error creating task:', error)
    return { task: null, error: 'Failed to create task' }
  }
}
