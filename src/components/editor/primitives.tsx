// Low-level, presentation-only form controls for the /edit editor.
// Every control is fully controlled (value + onChange). No content
// knowledge lives here — callers wire values to the draft.

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}

export function Field({ label, value, onChange, placeholder, hint }: FieldProps) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      <input
        className="ed-input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="ed-hint">{hint}</span> : null}
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
}: TextAreaProps) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      <textarea
        className="ed-textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="ed-hint">{hint}</span> : null}
    </label>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      <select
        className="ed-select"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <label className="ed-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ed-toggle-label">{label}</span>
      {hint ? <span className="ed-hint">{hint}</span> : null}
    </label>
  );
}
