import { useEffect, useState } from 'react';
import { api } from '../api';
import JsonTree from './JsonTree';

interface EnvData {
  id: string;
  network: string;
  height: number | null;
  online: number;
  offline: number;
  total: number;
  topology: any;
}

export default function EnvironmentsPanel() {
  const [envs, setEnvs] = useState<EnvData[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ids = await api.env().list();
        const data: EnvData[] = [];
        for (const id of ids) {
          try {
            const [info, topology] = await Promise.all([
              api.env(id).info(),
              api.env(id).topology(),
            ]);
            const internal = (topology as any).internal || {};
            const nodes = Object.values(internal) as any[];
            const total = nodes.length;
            const online = nodes.filter((n) => n.Internal?.online).length;
            const offline = total - online;
            data.push({
              id,
              network: info.network,
              height: info.block?.height ?? null,
              online,
              offline,
              total,
              topology,
            });
          } catch (e) {
            console.error(e);
          }
        }
        if (!cancelled) {
          setEnvs(data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h3>Environments</h3>
      {envs.map((env) => (
        <div key={env.id} style={{ marginBottom: '1rem' }}>
          <h4>{env.id}</h4>
          <p>Network: {env.network}</p>
          <p>Height: {env.height ?? 'unknown'}</p>
          <p>Agents Online: {env.online}</p>
          <p>Agents Offline: {env.offline}</p>
          <p>Total Agents: {env.total}</p>
          <JsonTree data={env.topology} />
        </div>
      ))}
    </div>
  );
}
