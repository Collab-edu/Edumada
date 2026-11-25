'use client'
import { useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { usePathname } from 'next/navigation'
import { HeaderItem } from '@/types/navigation'
import { stripLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

const samePath = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '')

const MobileHeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const t = useT()
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const path = stripLocale(usePathname())
  // Page en cours (ou une de ses sous-pages) : mise en évidence dans le menu.
  const active = samePath(path, item.href) || !!item.submenu?.some((sub) => samePath(path, sub.href))

  const handleToggle = () => {
    setSubmenuOpen(!submenuOpen)
  }

  return (
    <div className='relative w-full border-b border-gray-100'>
      <Link
        href={item.href}
        onClick={item.submenu ? handleToggle : undefined}
        aria-current={samePath(path, item.href) ? 'page' : undefined}
        className={cn(
          'flex w-full items-center justify-between px-3 py-3.5 text-base font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40',
          active ? 'text-primary' : 'text-black hover:text-primary'
        )}>
        {t(item.label)}
        <Icon
          icon={item.submenu ? 'tabler:chevron-down' : 'tabler:chevron-right'}
          className={cn('text-xl', active ? 'text-primary' : 'text-gray-500', item.submenu && submenuOpen && 'rotate-180')}
        />
      </Link>
      {submenuOpen && item.submenu && (
        <div className='bg-white p-2 w-full'>
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              aria-current={samePath(path, subItem.href) ? 'page' : undefined}
              className={cn('block rounded-lg px-3 py-2', samePath(path, subItem.href) ? 'font-semibold text-primary' : 'text-gray-500 hover:bg-gray-200')}>
              {t(subItem.label)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MobileHeaderLink
