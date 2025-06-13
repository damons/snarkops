import { useControlPlane } from '../controlPlane';

export default function ControlPlaneConsole() {
  const { events } = useControlPlane();

  return (
    <div style={{ width: '100%', maxWidth: '60rem', marginTop: '1rem' }}>
      <h3 style={{ textAlign: 'center' }}>Control Plane Events</h3>
      <div style={{ border: '1px solid #ccc', padding: '0.5rem', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
        {events.length === 0 ? (
          <div>No events received.</div>
        ) : (
          events.map((e, i) => (
            <pre key={i} style={{ margin: 0 }}>
              {JSON.stringify(e, null, 2)}
            </pre>
          ))
        )}
      </div>
    </div>
  );
}
