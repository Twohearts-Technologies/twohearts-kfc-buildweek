import type { ReactNode } from "react";

interface RepeaterProps {
  label: string;
  count: number;
  itemTitle: (index: number) => string;
  renderItem: (index: number) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  addLabel?: string;
}

// Generic ordered-list editor. It renders per-item add/remove/reorder
// controls and delegates the item body to renderItem. It is index-based
// and content-agnostic so it drives every array in SiteContent.
export function Repeater({
  label,
  count,
  itemTitle,
  renderItem,
  onAdd,
  onRemove,
  onMove,
  addLabel = "Add item",
}: RepeaterProps) {
  return (
    <div className="ed-repeater">
      <div className="ed-repeater-head">
        <span className="ed-label">{label}</span>
        <span className="ed-repeater-count">{count}</span>
      </div>
      {Array.from({ length: count }, (_, i) => (
        <div className="ed-item" key={i}>
          <div className="ed-item-head">
            <span className="ed-item-title">{itemTitle(i)}</span>
            <div className="ed-item-actions">
              <button
                type="button"
                className="ed-iconbtn"
                title="Move up"
                disabled={i === 0}
                onClick={() => onMove(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="ed-iconbtn"
                title="Move down"
                disabled={i === count - 1}
                onClick={() => onMove(i, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="ed-iconbtn ed-iconbtn-danger"
                title="Remove"
                onClick={() => onRemove(i)}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="ed-item-body">{renderItem(i)}</div>
        </div>
      ))}
      <button type="button" className="ed-btn ed-btn-ghost ed-btn-add" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}
