'use client'

import { HTMLAttributes } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MainNav({ className, ...props }: HTMLAttributes<HTMLElement>) {
  const pathName = usePathname()
  const params = useParams()

  const routes = [
    {
      href: `/${params.storeId}`,
      label: 'Home',
      active: pathName === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/products`,
      label: 'Products',
      active: pathName === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: 'Billboards',
      active: pathName === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      label: 'Categories',
      active: pathName === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/discounts`,
      label: 'Discounts',
      active: pathName === `/${params.storeId}/discounts`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: 'Sizes',
      active: pathName === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: 'Colors',
      active: pathName === `/${params.storeId}/colors`,
    },
    
  ]

  return (
    <nav className={cn('flex items-center space-x-8 lg:space-x-10', className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-lg font-semibold tracking-wide transition-all duration-200 hover:underline hover:text-primary',
            route.active
              ? 'text-black dark:text-white'
              : 'text-muted-foreground',
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
