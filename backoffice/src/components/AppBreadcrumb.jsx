import React from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

import { routes } from '../routes'

const AppBreadcrumb = () => {
  const pathname = useLocation().pathname
  const crumbs = []
  pathname.split('/').reduce((prev, curr, index, parts) => {
    const path = `${prev}/${curr}`.replace(/\/+/g, '/')
    const route = routes.find((r) => matchPath({ path: r.path, end: true }, path))
    if (route && curr) crumbs.push({ path, name: route.name, active: index + 1 === parts.length })
    return path
  })

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="#/dashboard">Accueil</CBreadcrumbItem>
      {crumbs.map((crumb) => (
        <CBreadcrumbItem
          key={crumb.path}
          {...(crumb.active ? { active: true } : { href: `#${crumb.path}` })}
        >
          {crumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
