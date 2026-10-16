import React from 'react'
import { CFooter } from '@coreui/react'
import { SITE_URL } from '../lib/api'

const AppFooter = () => (
  <CFooter className="px-4">
    <div>
      <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
        Edumada
      </a>
      <span className="ms-1">&copy; {new Date().getFullYear()} · Back-office</span>
    </div>
    <div className="ms-auto small text-body-secondary">
      Interface basée sur CoreUI (licence MIT)
    </div>
  </CFooter>
)

export default React.memo(AppFooter)
