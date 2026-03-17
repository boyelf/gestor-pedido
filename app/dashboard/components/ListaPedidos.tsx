'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

import { Searchbar } from '@/components/ui/Searchbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TarjetaPedido from '@/components/TarjetaPedido'
import { EstadoPedido, getPedidos, Pedido } from '@/actions/pedido/get-pedidos'

interface ListaPedidosState {
  pedidos: Pedido[]
  loading: boolean
  hasMore: boolean
  page: number
  totalCount: number
}

interface Filters {
  search: string
  estado: 'all' | EstadoPedido
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function ListaPedidos() {
  const [state, setState] = useState<ListaPedidosState>({
    pedidos: [],
    loading: false,
    hasMore: true,
    page: 0,
    totalCount: 0,
  })

  const [filters, setFilters] = useState<Filters>({
    search: '',
    estado: 'all',
  })

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 600)

  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)
  const loadPedidosRef = useRef<((pageNum: number, reset: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  const loadPedidos = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (isLoadingRef.current) return
      isLoadingRef.current = true

      try {
        if (reset) {
          setState((prev) => ({ ...prev, loading: true, page: 0 }))
        } else {
          setIsLoadingMore(true)
        }

        const { pedidos, total, error } = await getPedidos({
          page: pageNum,
          pageSize: 10,
          estado: filters.estado,
          search: filters.search,
        })

        if (error) {
          toast.error(error)
          return
        }

        setState((prev) => {
          let newPedidos = pedidos

          if (!reset && prev.pedidos.length > 0) {
            const existingIds = new Set(prev.pedidos.map((p) => p.id))
            newPedidos = pedidos.filter((p) => !existingIds.has(p.id))
          }

          return {
            ...prev,
            pedidos: reset ? pedidos : [...prev.pedidos, ...newPedidos],
            totalCount: total,
            hasMore: reset
              ? pedidos.length === 10
              : prev.pedidos.length + newPedidos.length < total,
            page: reset ? 1 : prev.page + 1,
            loading: false,
          }
        })
      } catch (error) {
        toast.error('Error al cargar pedidos')
        console.error(error)
      } finally {
        setIsLoadingMore(false)
        isLoadingRef.current = false
      }
    },
    [filters]
  )

  useEffect(() => {
    loadPedidosRef.current = loadPedidos
  }, [loadPedidos])

  useEffect(() => {
    const load = async () => {
      if (loadPedidosRef.current) {
        await loadPedidosRef.current(0, true)
      }
    }
    load()
  }, [filters])

  useEffect(() => {
    const target = observerTarget.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          state.hasMore &&
          !isLoadingRef.current &&
          !state.loading &&
          loadPedidosRef.current
        ) {
          loadPedidosRef.current(state.page, false)
        }
      },
      { threshold: 0.1 }
    )

    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [state.hasMore, state.page, state.loading])

  const handleEstadoChange = (value: 'all' | EstadoPedido) => {
    setFilters((prev) => ({ ...prev, estado: value }))
  }

  const handlePedidoEstadoUpdated = (pedidoId: string, estado: EstadoPedido) => {
    setState((prev) => ({
      ...prev,
      pedidos: prev.pedidos.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, estado } : pedido
      ),
    }))
  }

  return (
    <div className="space-y-6 py-8 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-gray-500 mt-1">
            Total de pedidos: <span className="font-semibold">{state.totalCount}</span>
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/crearpedido">+ Nuevo Pedido</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4">
        <div className="md:col-span-8 space-y-2">
          <label className="text-sm font-medium">Buscar por dirección o ID de pedido</label>
          <Searchbar
            placeholder="Ej: Calle Diana No. 48 o 1024"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="md:col-span-4 space-y-1">
          <label className="text-sm font-medium flex items-center gap-2">
            <Filter size={16} /> Estado
          </label>
          <Select value={filters.estado} onValueChange={handleEstadoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en-proceso">En proceso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.loading && !state.pedidos.length ? (
          <div className="flex justify-center items-center py-12 col-span-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : state.pedidos.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex justify-center items-center py-12">
              <p className="text-gray-500">No hay pedidos que mostrar</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {state.pedidos.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                onEstadoUpdated={handlePedidoEstadoUpdated}
              />
            ))}

            {state.hasMore && (
              <div ref={observerTarget} className="col-span-full flex justify-center py-8">
                {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

