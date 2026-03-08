'use server'

import { createClient } from '@/lib/supabase/server'
import { Task, Status } from '@/app/dashboard/components/TaskForm'

interface UpdateTaskData {
  taskId: string
  title?: string
  description?: string
  status?: Status
  priority?: 'low' | 'medium' | 'high'
  image?: File | null
  existingImage?: string | null
  removeImage?: boolean
}

export async function updateTask(data: UpdateTaskData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { task: null, error: 'No authenticated user' }
    }

    // Get current task to verify ownership
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', data.taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentTask) {
      return { task: null, error: 'Task not found or unauthorized' }
    }

    let imageUrl = currentTask.image

    // Handle image deletion
    if (data.removeImage && currentTask.image) {
      // Delete old image from storage
      const imagePath = currentTask.image.split('task-images/')[1]
      if (imagePath) {
        await supabase.storage.from('task-images').remove([imagePath])
      }
      imageUrl = null
    }

    // Handle new image upload
    if (data.image) {
      // Delete old image if exists
      if (currentTask.image) {
        const imagePath = currentTask.image.split('task-images/')[1]
        if (imagePath) {
          await supabase.storage.from('task-images').remove([imagePath])
        }
      }

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

    // Update task
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.title !== undefined) updatePayload.title = data.title
    if (data.description !== undefined) updatePayload.description = data.description
    if (data.status !== undefined) updatePayload.status = data.status
    if (data.priority !== undefined) updatePayload.priority = data.priority
    if (imageUrl !== undefined) updatePayload.image = imageUrl

    const { data: taskData, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', data.taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { task: null, error: error.message }
    }

    return { task: taskData as Task, error: null }
  } catch (error) {
    console.error('Error updating task:', error)
    return { task: null, error: 'Failed to update task' }
  }
}
