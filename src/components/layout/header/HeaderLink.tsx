'use client'
import { useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { HeaderItem } from '@/types/navigation'
import { usePathname } from 'next/navigation'
import { stripLocale } from '@/i18n/config'

const HeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const t = useT()
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const path = stripLocale(usePathname())
  const handleMouseEnter = () => {
    if (item.submenu) {
      setSubmenuOpen(true)
    }
  }
  const handleMouseLeave = () => {
    setSubmenuOpen(false)
  }

  return (
    <div
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <Link
        href={item.href}
        className={`text-[15px] 2xl:text-base flex whitespace-nowrap font-medium hover:text-primary capitalized  ${
          path.replace(/\/+$/, '') === item.href.replace(/\/+$/, '') ? 'text-primary ' : 'text-black'
        }`}>
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
      {submenuOpen && (
        <div
          className={`absolute py-2 left-0 mt-0.5 w-60 bg-white dark:bg-darklight dark:text-white shadow-lg rounded-lg `}
          data-aos='fade-up'
          data-aos-duration='500'>
          {item.submenu?.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className={`block px-4 py-2   ${
                path === subItem.href
                  ? 'bg-primary text-white'
                  : 'text-black dark:text-white hover:bg-primary'
              }`}>
              {t(subItem.label)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderLink
