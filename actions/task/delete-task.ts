'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No authenticated user' }
    }

    // Get task to verify ownership and get image URL
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('image')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !task) {
      return { success: false, error: 'Task not found or unauthorized' }
    }

    // Delete image from storage if exists
    if (task.image) {
      const imagePath = task.image.split('task-images/')[1]
      if (imagePath) {
        await supabase.storage.from('task-images').remove([imagePath])
      }
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}
