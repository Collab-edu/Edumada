import { CFooter } from '@coreui/react'
import { SITE_URL } from '@/lib/api'

export default function AppFooter() {
    return (
        <CFooter className='px-4 flex-wrap gap-1'>
            <div>
                <a href={SITE_URL} target='_blank' rel='noopener noreferrer' className='fw-semibold text-decoration-none'>
                    Edumada
                </a>
                <span className='ms-1'>&copy; {new Date().getFullYear()} · Back-office</span>
            </div>
        </CFooter>
    )
}
