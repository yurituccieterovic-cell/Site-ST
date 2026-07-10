export default function HistorySidebar({ isOpen, items, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <span className="sidebar-title">Histórico</span>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="sidebar-list">
          {items.length === 0
            ? <p className="sidebar-empty">Nenhuma conversa ainda.</p>
            : items.map(item => (
              <div key={item.id} className="hist-item">{item.label}</div>
            ))
          }
        </div>
      </div>
    </aside>
  );
}
