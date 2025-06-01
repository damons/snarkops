import React from 'react';
import './JsonTable.css';

interface JsonTableProps {
  data: any;
}

function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return (
        <table className="json-table">
          <tbody>
            {value.map((v, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{renderValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return (
      <table className="json-table">
        <tbody>
          {Object.entries(value).map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{renderValue(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return String(value);
}

export default function JsonTable({ data }: JsonTableProps) {
  return <>{renderValue(data)}</>;
}
