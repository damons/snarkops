import { Link, Route, Routes } from 'react-router-dom';
import AgentsPage from './pages/AgentsPage';
import EnvsPage from './pages/EnvsPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Dashboard</Link> |{' '}
        <Link to="/agents">Agents</Link> |{' '}
        <Link to="/envs">Environments</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/envs" element={<EnvsPage />} />
      </Routes>
    </>
  );
}
