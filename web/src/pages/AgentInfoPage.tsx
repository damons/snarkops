import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import JsonTable from '../components/JsonTable';

interface AgentStatus {
  agent_id: string;
  is_connected: boolean;
  external_ip?: string;
  internal_ip?: string;
  state: any;
}

export default function AgentInfoPage() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<AgentStatus | null>(null);

  useEffect(() => {
    if (!agentId) return;
    api.agents
      .get(agentId)
      .then(setAgent)
      .catch((e) => console.error(e));
  }, [agentId]);

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Agent {agent.agent_id}</h2>
      <p>Status: {agent.is_connected ? 'online' : 'offline'}</p>
      {agent.external_ip && <p>External IP: {agent.external_ip}</p>}
      {agent.internal_ip && <p>Internal IP: {agent.internal_ip}</p>}
      <h3>Agent Info</h3>
      <JsonTable data={agent.state} />
      <Link to="/agents">Back to Agents</Link>
    </div>
  );
}
