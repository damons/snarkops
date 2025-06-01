import { useState } from 'react';

interface TreeNodeProps {
  label: string;
  value: any;
  defaultExpanded?: boolean;
}

function TreeNode({ label, value, defaultExpanded = false }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isObject = value !== null && typeof value === 'object';
  const toggle = () => {
    if (isObject) {
      setExpanded(!expanded);
    }
  };

  return (
    <div style={{ marginLeft: '1rem' }}>
      <div onClick={toggle} style={{ cursor: isObject ? 'pointer' : 'default' }}>
        {isObject ? (expanded ? '▾' : '▸') : '-'} {label}
        {!isObject && ': '}
        {!isObject && String(value)}
      </div>
      {isObject && expanded && (
        <div>
          {Array.isArray(value)
            ? value.map((v, i) => (
                <TreeNode key={i} label={String(i)} value={v} />
              ))
            : Object.entries(value).map(([k, v]) => (
                <TreeNode key={k} label={k} value={v} />
              ))}
        </div>
      )}
    </div>
  );
}

export default function JsonTree({ data }: { data: any }) {
  return (
    <div>
      <TreeNode label="root" value={data} defaultExpanded />
    </div>
  );
}
