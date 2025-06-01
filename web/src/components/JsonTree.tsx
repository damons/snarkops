import { useState } from 'react';

interface JsonTreeProps {
  data: any;
  label?: string;
}

function Node({ label, value }: { label: string; value: any }) {
  const [open, setOpen] = useState(false);
  const isObject = value !== null && typeof value === 'object';

  if (isObject) {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [String(i), v] as [string, any])
      : Object.entries(value);
    return (
      <div style={{ marginLeft: '1rem' }}>
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setOpen(!open)}
        >
          {open ? '▾' : '▸'} {label}
        </span>
        {open && (
          <div>
            {entries.map(([k, v]) => (
              <Node key={k} label={k} value={v} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ marginLeft: '1rem' }}>
      <span>
        {label}: {String(value)}
      </span>
    </div>
  );
}

export default function JsonTree({ data, label = 'root' }: JsonTreeProps) {
  return <Node label={label} value={data} />;
}
