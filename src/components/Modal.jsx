export default function Modal({ isOpen, onClose, title, titleColor = 'cyan', children }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
        <h3 className={`neon-${titleColor === 'cyan' ? '' : titleColor + '-'}text`.replace('neon--text', 'neon-text')}>
          {title}
        </h3>
        <div className="content">{children}</div>
        {onClose && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-small" onClick={onClose}>OK</button>
          </div>
        )}
      </div>
    </div>
  )
}
