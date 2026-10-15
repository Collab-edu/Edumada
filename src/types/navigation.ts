export type NavLink = {
  label: string
  href: string
}

export type HeaderItem = NavLink & {
  submenu?: NavLink[]
}

export type FooterLinkType = {
  section: string
  links: NavLink[]
}
