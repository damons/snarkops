import EnvironmentsPanel from '../components/EnvironmentsPanel';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h2>Welcome to snops.io Web</h2>
      <EnvironmentsPanel />
    </div>
  );
}
