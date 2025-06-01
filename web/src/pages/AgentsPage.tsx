import { useEffect, useState } from 'react';
import { Snops } from 'snops_sdk';

interface AgentStatus {
  agent_id: string;
  is_connected: boolean;
  external_ip?: string;
}

const api = new Snops('');

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  useEffect(() => {
    api.agents
      .list()
      .then(setAgents)
      .catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <h2>Agents</h2>
      <ul>
        {agents.map((a) => (
          <li key={a.agent_id}>
            {a.agent_id} - {a.is_connected ? 'online' : 'offline'}{' '}
            {a.external_ip && `(${a.external_ip})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
