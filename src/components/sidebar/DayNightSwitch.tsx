import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface DayNightSwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Uniform scale. The control is authored at 90×50 and scaled from there. */
  scale?: number;
  /** Show the AM / PM captions either side. Off in the collapsed rail. */
  showLabels?: boolean;
  className?: string;
  title?: string;
}

/**
 * A sun that slides across and becomes a cratered moon, with the three cloud
 * streaks contracting into stars.
 *
 * Ported from styled-components to plain CSS in `index.css`, the same way
 * `ui/theme-switch.tsx` was — this project has no styled-components dependency
 * and adding a second CSS-in-JS runtime for one control is not a trade worth
 * making. Scale and label visibility pass through as custom properties so the
 * markup stays static.
 *
 * The 1400ms travel is not arbitrary: it is the same duration as the sidebar's
 * peel, so the handle finishes its journey exactly as the skin finishes
 * turning over.
 */
export function DayNightSwitch({
  id,
  checked = false,
  onChange,
  scale = 1,
  showLabels = true,
  className,
  title = 'Toggle day and night theme',
}: DayNightSwitchProps) {
  const generated = useId().replace(/:/g, '');
  const inputId = id ?? `dn-${generated}`;

  return (
    <div
      className={cn('dn-switch', className)}
      style={
        {
          '--dn-scale': scale,
          '--dn-pad': showLabels ? '44px' : '2px',
          '--dn-label': showLabels ? 'block' : 'none',
        } as React.CSSProperties
      }
    >
      <div className="dn-switch__wrap">
        <input
          className="dn-switch__input"
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-label={title}
        />
        <label className="dn-switch__toggle" htmlFor={inputId} title={title}>
          <span className="dn-switch__handler">
            <span className="dn-switch__crater dn-switch__crater--1" />
            <span className="dn-switch__crater dn-switch__crater--2" />
            <span className="dn-switch__crater dn-switch__crater--3" />
          </span>
          <span className="dn-switch__star dn-switch__star--1" />
          <span className="dn-switch__star dn-switch__star--2" />
          <span className="dn-switch__star dn-switch__star--3" />
          <span className="dn-switch__star dn-switch__star--4" />
          <span className="dn-switch__star dn-switch__star--5" />
          <span className="dn-switch__star dn-switch__star--6" />
        </label>
      </div>
    </div>
  );
}

export default DayNightSwitch;
