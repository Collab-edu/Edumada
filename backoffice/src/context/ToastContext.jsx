import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CToast, CToastBody, CToaster, CToastClose } from '@coreui/react'

const ToastContext = createContext(() => {})

/** Notifications du back-office : toast.success('…'), toast.error('…'). */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const counter = useRef(0)

  const push = useCallback((message, color) => {
    counter.current += 1
    setToast(
      <CToast
        key={counter.current}
        autohide
        delay={color === 'danger' ? 7000 : 4000}
        color={color}
        className="text-white align-items-center"
      >
        <div className="d-flex">
          <CToastBody>{message}</CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>,
    )
  }, [])

  const api = useMemo(
    () => ({
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'danger'),
      info: (m) => push(m, 'info'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <CToaster push={toast} placement="bottom-end" className="p-3" />
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = { children: PropTypes.node }

export const useToast = () => useContext(ToastContext)
