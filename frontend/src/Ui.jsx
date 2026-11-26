import { useEffect, useRef, useState } from 'react'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

export function price(cents) {
  return usd.format(cents / 100)
}

export function displayDate(date) {
  return dateFormat.format(new Date(date))
}

export function Message({ error }) {
  return error && <p className="error" role="alert">{error}</p>
}

export function PropertyPhoto({ src, className = '', loading = 'lazy', alt = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)

  return (
    <div className={`property-photo ${className}`}>
      {src && src !== failedSrc ? (
        <img src={src} alt={alt} loading={loading} onError={() => setFailedSrc(src)} />
      ) : (
        <span>Photo unavailable</span>
      )}
    </div>
  )
}

const statusLabels = {
  PENDING_APPROVAL: 'Pending approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REMOVED: 'Removed',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

export function Status({ value }) {
  return <span className={`status status-${value.toLowerCase()}`}>{statusLabels[value]}</span>
}

export function ConfirmDialog({ title, children, action, onClose, onConfirm }) {
  const dialog = useRef(null)
  const cancel = useRef(null)

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    cancel.current.focus()
    return () => element.close()
  }, [])

  return (
    <dialog ref={dialog} className="confirm-dialog" aria-label={title} onCancel={onClose}>
      <h2>{title}</h2>
      <p>{children}</p>
      <div className="dialog-actions">
        <button ref={cancel} onClick={onClose}>Keep it</button>
        <button className="danger" onClick={onConfirm}>{action}</button>
      </div>
    </dialog>
  )
}
