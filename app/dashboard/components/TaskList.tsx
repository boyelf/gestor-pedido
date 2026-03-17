'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Task, TaskForm } from './TaskForm'
import { TaskFilters, Status } from './TaskFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Edit2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTasks } from '@/actions/task/get-task'
import { deleteTask } from '@/actions/task/delete-task'
import Image from 'next/image'
import { TaskCard } from './TaskCard'

interface TaskListState {
  tasks: Task[]
  loading: boolean
  hasMore: boolean
  page: number
  totalCount: number
}

interface Filters {
  search: string
  status: string
  priority: string
}

export function TaskList() {
  const [state, setState] = useState<TaskListState>({
    tasks: [],
    loading: false,
    hasMore: true,
    page: 0,
    totalCount: 0,
  })

  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    priority: 'all',
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)
  const loadTasksRef = useRef<((pageNum: number, reset: boolean) => Promise<void>) | null>(null)

  // Load tasks function
  const loadTasks = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      // Prevenir múltiples llamadas simultáneas
      if (isLoadingRef.current) return
      isLoadingRef.current = true

      try {
        if (reset) {
          setState((prev) => ({ ...prev, loading: true, page: 0 }))
        } else {
          setIsLoadingMore(true)
        }

        const { tasks, total, error } = await getTasks({
          page: pageNum,
          pageSize: 10,
          status: filters.status,
          priority: filters.priority,
          search: filters.search,
        })

        if (error) {
          toast.error(error)
          return
        }

        setState((prev) => {
          let newTasks = tasks
          
          // Si no es reset, eliminar duplicados
          if (!reset && prev.tasks.length > 0) {
            const existingIds = new Set(prev.tasks.map(t => t.id))
            newTasks = tasks.filter(t => !existingIds.has(t.id))
          }

          return {
            ...prev,
            tasks: reset ? tasks : [...prev.tasks, ...newTasks],
            totalCount: total,
            hasMore: reset
              ? tasks.length === 10
              : prev.tasks.length + newTasks.length < total,
            page: reset ? 1 : prev.page + 1,
            loading: false,
          }
        })
      } catch (error) {
        toast.error('Error al cargar tareas')
        console.error(error)
      } finally {
        setIsLoadingMore(false)
        isLoadingRef.current = false
      }
    },
    [filters]
  )

  // Actualizar el ref de loadTasks
  useEffect(() => {
    loadTasksRef.current = loadTasks
  }, [loadTasks])

  // Initial load
  useEffect(() => {
    const load = async () => {
      if (loadTasksRef.current) {
        await loadTasksRef.current(0, true)
      }
    }
    load()
  }, [filters])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          state.hasMore &&
          !isLoadingRef.current &&
          !state.loading &&
          loadTasksRef.current
        ) {
          loadTasksRef.current(state.page, false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [state.hasMore, state.page, state.loading])

  const handleDelete = async (taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      const { success, error } = await deleteTask(taskToDelete)

      if (error) {
        toast.error(error)
        return
      }

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskToDelete),
        totalCount: prev.totalCount - 1,
      }))

      toast.success('Tarea eliminada correctamente')
    } catch (error) {
      toast.error('Error al eliminar la tarea')
      console.error(error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedTask(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    // Reload tasks from first page
    loadTasks(0, true)
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }))
  }

  const handlePriorityChange = (value: string) => {
    setFilters((prev) => ({ ...prev, priority: value }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-purple-100 text-purple-800'
      case 'review':
        return 'bg-orange-100 text-orange-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Pendiente'
      case 'in-progress':
        return 'En curso'
      case 'review':
        return 'En revisión'
      case 'done':
        return 'Completada'
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baja'
      case 'medium':
        return 'Media'
      case 'high':
        return 'Alta'
      default:
        return priority
    }
  }

  return (
    <div className="space-y-6 py-8 px-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-gray-500 mt-1">
            Total de pedidos: <span className="font-semibold">{state.totalCount}</span>
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          + Nuevo Pedido
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        currentFilters={filters}
      />

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.loading && !state.tasks.length ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : state.tasks.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center items-center py-12">
              <p className="text-gray-500">No hay tareas que mostrar</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {state.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  status: task.status,
                  priority: task.priority,
                  created_at: Number(task.created_at),
                  image: task.image,
                }}
                onEdit={handleEditTask}
                onDelete={(taskToDelete) => handleDelete(taskToDelete.id)}
              />
            ))}

            {/* Infinite scroll trigger */}
            {state.hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isLoadingMore && (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Task Form Dialog */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la tarea y todas sus imágenes asociadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
