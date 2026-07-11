// Editor for a flat string[] (action chips, workflow chips). Each entry
// is an inline text input with a remove control; an add button appends
// an empty string. Order is preserved; reordering is intentionally out
// of scope for these short, unordered tag lists.
interface ChipsEditorProps {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}

export function ChipsEditor({ label, items, onChange }: ChipsEditorProps) {
  const setAt = (index: number, value: string) => {
    const next = items.slice();
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="ed-field">
      <span className="ed-label">{label}</span>
      <div className="ed-chips">
        {items.map((chip, i) => (
          <div className="ed-chip" key={i}>
            <input
              className="ed-input ed-chip-input"
              type="text"
              value={chip}
              onChange={(e) => setAt(i, e.target.value)}
            />
            <button
              type="button"
              className="ed-iconbtn ed-iconbtn-danger"
              title="Remove"
              onClick={() => removeAt(i)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="ed-btn ed-btn-ghost ed-btn-add"
        onClick={() => onChange([...items, ""])}
      >
        + Add chip
      </button>
    </div>
  );
}
