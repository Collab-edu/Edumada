import { useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { usePathname } from 'next/navigation'
import { HeaderItem } from '@/types/navigation'
import { stripLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

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
    <div className='relative w-full'>
      <Link
        href={item.href}
        onClick={item.submenu ? handleToggle : undefined}
        aria-current={samePath(path, item.href) ? 'page' : undefined}
        className={cn(
          'flex items-center justify-between w-full rounded-lg px-3 py-2.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40',
          active ? 'bg-cream font-semibold text-primary' : 'text-black hover:bg-offwhite'
        )}>
        {t(item.label)}
        {item.submenu && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1.5em'
            height='1.5em'
            viewBox='0 0 24 24'>
            <path
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
              d='m7 10l5 5l5-5'
            />
          </svg>
        )}
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
