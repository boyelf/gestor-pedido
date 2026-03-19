'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BarChart3, LayoutGrid, Menu, X } from 'lucide-react'

import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn, getImageUrlWithTimestamp } from '@/lib/utils'

type AppShellProps = {
  children: React.ReactNode
}

const MENU_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
  },
  {
    href: '/metricas',
    label: 'Metricas',
    icon: BarChart3,
  },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activePath = pathname.startsWith('/metricas') ? '/metricas' : '/dashboard'

  return (
    <div className='min-h-screen bg-background'>
      <header className='md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75'>
        <div className='px-4 py-3 flex items-center justify-between'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setMobileOpen(true)}
            aria-label='Abrir menu'
          >
            <Menu size={20} />
          </Button>

          <div className='text-base font-extrabold tracking-tight flex items-center gap-2'>
            <LayoutGrid size={20} />
            Gestor Pedidos
          </div>

          {user ? (
            <Link href='/profile'>
              <AvatarBadge
                name={user?.name || 'Usuario'}
                avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined}
              />
            </Link>
          ) : (
            <div className='w-9' />
          )}
        </div>
      </header>

      <div className='flex min-h-screen'>
        <aside className='hidden md:flex w-64 border-r bg-card flex-col'>
          <div className='h-16 px-5 border-b flex items-center'>
            <div className='text-xl font-extrabold tracking-tight flex items-center gap-3'>
              <LayoutGrid size={28} />
              Gestor Pedidos
            </div>
          </div>

          <nav className='p-4 space-y-2'>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activePath === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-700 hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className='flex-1 min-w-0'>
          <header className='hidden md:flex h-16 border-b px-6 items-center justify-end bg-background'>
            {user && (
              <Link href='/profile' className='inline-flex'>
                <AvatarBadge
                  name={user?.name || 'Usuario'}
                  avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined}
                />
              </Link>
            )}
          </header>
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className='md:hidden fixed inset-0 z-50'>
          <button
            type='button'
            className='absolute inset-0 bg-black/40'
            aria-label='Cerrar menu'
            onClick={() => setMobileOpen(false)}
          />

          <aside className='relative h-full w-[82%] max-w-xs border-r bg-card p-4 flex flex-col'>
            <div className='flex items-center justify-between mb-5'>
              <div className='text-lg font-extrabold tracking-tight flex items-center gap-2'>
                <LayoutGrid size={22} />
                Gestor Pedidos
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setMobileOpen(false)}
                aria-label='Cerrar menu'
              >
                <X size={18} />
              </Button>
            </div>

            <nav className='space-y-2'>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activePath === item.href

                return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-slate-700 hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className='mt-auto pt-4 border-t'>
              {user && (
                <Link href='/profile' className='inline-flex' onClick={() => setMobileOpen(false)}>
                  <AvatarBadge
                    name={user?.name || 'Usuario'}
                    avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined}
                  />
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
