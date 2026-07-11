import type { ThemeContent } from "../../types/content";
import { Toggle } from "./primitives";

// The three brand-approved KFC reds, offered as one-click swatches
// alongside a free color picker and a raw hex field.
const PRESETS: readonly { value: string; label: string }[] = [
  { value: "#E4002B", label: "KFC Red" },
  { value: "#B80023", label: "Deep Red" },
  { value: "#E9384A", label: "Twohearts Red" },
];

interface ThemeControlsProps {
  theme: ThemeContent;
  onColorChange: (hex: string) => void;
  onTextureChange: (show: boolean) => void;
}

export function ThemeControls({
  theme,
  onColorChange,
  onTextureChange,
}: ThemeControlsProps) {
  return (
    <div className="ed-theme">
      <div className="ed-field">
        <span className="ed-label">KFC co-brand red</span>
        <div className="ed-color-row">
          <input
            type="color"
            className="ed-color-swatch"
            value={theme.kfcRed}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label="Pick KFC red"
          />
          <input
            type="text"
            className="ed-input ed-color-hex"
            value={theme.kfcRed}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label="KFC red hex value"
          />
        </div>
        <div className="ed-swatches">
          {PRESETS.map((preset) => {
            const active =
              theme.kfcRed.toLowerCase() === preset.value.toLowerCase();
            return (
              <button
                type="button"
                key={preset.value}
                className="ed-preset"
                data-active={active}
                onClick={() => onColorChange(preset.value)}
              >
                <span
                  className="ed-preset-dot"
                  style={{ background: preset.value }}
                />
                <span className="ed-preset-label">{preset.label}</span>
                <span className="ed-preset-hex">{preset.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Toggle
        label="Show texture overlay"
        checked={theme.showTexture}
        onChange={onTextureChange}
        hint="Low-opacity texture on the dark teal sections."
      />
    </div>
  );
}
