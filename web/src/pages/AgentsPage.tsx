import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

interface AgentStatus {
  agent_id: string;
  is_connected: boolean;
  external_ip?: string;
  state: any;
}

interface EnvInfo {
  network: string;
}

interface AgentRow {
  agentId: string;
  network: string;
  nodeKey: string;
  online: boolean;
  internalPeers: number;
  externalPeers: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [envNetworks, setEnvNetworks] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: keyof AgentRow; dir: 'asc' | 'desc' }>({
    key: 'agentId',
    dir: 'asc',
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<string>('kill');

  useEffect(() => {
    async function load() {
      try {
        const ag = await api.agents.list();
        setAgents(ag);

        const envIds = Array.from(
          new Set(
            ag.flatMap((a: any) => {
              const state = a.state;
              if (state && state.Node) {
                const [envId] = state.Node as [string, any];
                return [envId];
              }
              return [];
            })
          )
        );

        const networks: Record<string, string> = {};
        await Promise.all(
          envIds.map(async (id) => {
            try {
              const info: EnvInfo = await api.env(id).info();
              networks[id] = info.network;
            } catch (e) {
              console.error(e);
            }
          })
        );

        setEnvNetworks(networks);
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  const rows: AgentRow[] = agents.map((a: any) => {
    let network = '';
    let nodeKey = '';
    let online = false;
    let internalPeers = 0;
    let externalPeers = 0;

    const state = a.state;
    if (state && state.Node) {
      const [envId, nodeState] = state.Node as [string, any];
      network = envNetworks[envId] || envId;
      nodeKey = nodeState.node_key;
      online = nodeState.online;
      if (Array.isArray(nodeState.peers)) {
        for (const p of nodeState.peers) {
          if (p && typeof p === 'object') {
            if ('Internal' in p) internalPeers += 1;
            if ('External' in p) externalPeers += 1;
          }
        }
      }
    }

    return {
      agentId: a.agent_id,
      network,
      nodeKey,
      online,
      internalPeers,
      externalPeers,
    };
  });

  const sorted = [...rows].sort((a, b) => {
    const { key, dir } = sort;
    const av = a[key];
    const bv = b[key];
    let cmp = 0;
    if (typeof av === 'string' && typeof bv === 'string') {
      cmp = av.localeCompare(bv);
    } else {
      cmp = av === bv ? 0 : av > bv ? 1 : -1;
    }
    return dir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (key: keyof AgentRow) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const handleExecute = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Execute ${action} on ${selected.size} agent(s)?`)) return;

    for (const id of Array.from(selected)) {
      try {
        switch (action) {
          case 'kill':
            await api.agents.kill(id);
            break;
          case 'status':
            await api.agents.status(id);
            break;
          case 'tps':
            await api.agents.tps(id);
            break;
          case 'set-log-level': {
            const level = window.prompt('Log level', 'info');
            if (level) await api.agents.setLogLevel(id, level);
            break;
          }
          case 'set-snarkos-log': {
            const v = window.prompt('Verbosity', '0');
            if (v) await api.agents.setSnarkosLogLevel(id, parseInt(v, 10));
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    setSelected(new Set());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Agents</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          ACTION{' '}
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="kill">kill</option>
            <option value="status">status</option>
            <option value="tps">tps</option>
            <option value="set-log-level">set log level</option>
            <option value="set-snarkos-log">set snarkos log level</option>
          </select>
        </label>{' '}
        <button onClick={handleExecute} disabled={selected.size === 0}>EXECUTE</button>
      </div>
      <table className="json-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('agentId')}>AGENT ID</th>
            <th>SELECT</th>
            <th onClick={() => handleSort('network')}>NETWORK</th>
            <th onClick={() => handleSort('nodeKey')}>NODE KEY</th>
            <th onClick={() => handleSort('online')}>ONLINE</th>
            <th onClick={() => handleSort('internalPeers')}>INTERNAL PEERS</th>
            <th onClick={() => handleSort('externalPeers')}>EXTERNAL PEERS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.agentId}>
              <td>
                <Link to={`/agents/${r.agentId}`}>{r.agentId}</Link>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(r.agentId)}
                  onChange={(e) => {
                    const ns = new Set(selected);
                    if (e.target.checked) ns.add(r.agentId);
                    else ns.delete(r.agentId);
                    setSelected(ns);
                  }}
                />
              </td>
              <td>{r.network}</td>
              <td>{r.nodeKey}</td>
              <td>{r.online ? 'yes' : 'no'}</td>
              <td>{r.internalPeers}</td>
              <td>{r.externalPeers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
