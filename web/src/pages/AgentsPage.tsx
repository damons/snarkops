import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ControlPlaneConsole from "../components/ControlPlaneConsole";

interface AgentStatus {
  agent_id: string;
  is_connected: boolean;
  external_ip?: string;
  internal_ip?: string;
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
  height: number | null;
  internalPeers: number;
  externalPeers: number;
  peers: {
    clients: number;
    validators: number;
    total: number;
  };
}

type ColumnKey = "select" | keyof AgentRow;

interface Column {
  key: ColumnKey;
  label: string;
  sortable?: boolean;
}

const defaultColumns: Column[] = [
  { key: "select", label: "SELECT" },
  { key: "agentId", label: "AGENT ID", sortable: true },
  { key: "network", label: "NETWORK", sortable: true },
  { key: "nodeKey", label: "NODE KEY", sortable: true },
  { key: "online", label: "ONLINE", sortable: true },
  { key: "height", label: "HEIGHT", sortable: true },
  { key: "internalPeers", label: "INTERNAL PEERS", sortable: true },
  { key: "externalPeers", label: "EXTERNAL PEERS", sortable: true },
  { key: "peers", label: "PEERS (C,V,T)", sortable: false },
];

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [envNetworks, setEnvNetworks] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{
    key: keyof AgentRow;
    dir: "asc" | "desc";
  }>({
    key: "agentId",
    dir: "asc",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<string>("kill");
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [dragCol, setDragCol] = useState<number | null>(null);
  const [heights, setHeights] = useState<Record<string, number | null>>({});
  const [refreshRate, setRefreshRate] = useState<number>(10);
  const [peerMetrics, setPeerMetrics] = useState<Record<string, { clients: number; validators: number; total: number }>>({});

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
            }),
          ),
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
          }),
        );

        setEnvNetworks(networks);
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (agents.length === 0) return;

    let cancelled = false;

    async function fetchHeights() {
      const res: Record<string, number | null> = {};
      await Promise.all(
        agents.map(async (a: any) => {
          const state = a.state;
          if (state && state.Node) {
            const [envId, nodeState] = state.Node as [string, any];
            const network = envNetworks[envId] || envId;
            const ip = a.internal_ip;
            if (nodeState.online && ip) {
              try {
                const resp = await fetchWithTimeout(
                  `http://${ip}:3030/${network}/block/height/latest`,
                  5000
                );
                const text = await resp.text();
                const h = parseInt(text, 10);
                res[a.agent_id] = Number.isNaN(h) ? null : h;
              } catch (e) {
                // Network issues are common; quietly mark height as unavailable
                res[a.agent_id] = null;
              }
            } else {
              res[a.agent_id] = null;
            }
          }
        })
      );
      if (!cancelled) setHeights(res);
    }

    fetchHeights();
    const id = setInterval(fetchHeights, refreshRate * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [agents, envNetworks, refreshRate]);

  useEffect(() => {
    async function fetchPeers() {
      agents.forEach(async (a: any) => {
        if (!a.is_connected) return;
        const ip = a.internal_ip;
        const state = a.state;
        if (!ip || !(state && state.Node)) return;
        const [envId] = state.Node as [string, any];
        const network = envNetworks[envId] || envId;
        try {
          const res = await fetch(`http://${ip}:3030/${network}/peers/all/metrics`);
          if (!res.ok) return;
          const peers = await res.json();
          let clients = 0;
          let validators = 0;
          for (const p of peers) {
            if (Array.isArray(p) && p.length >= 2) {
              if (p[1] === "Client") clients += 1;
              if (p[1] === "Validator") validators += 1;
            }
          }
          setPeerMetrics(prev => ({
            ...prev,
            [a.agent_id]: { clients, validators, total: clients + validators },
          }));
        } catch (e) {
          console.error(e);
        }
      });
    }

    if (agents.length > 0) {
      fetchPeers();
    }
  }, [agents, envNetworks]);

  const rows: AgentRow[] = agents.map((a: any) => {
    let network = "";
    let nodeKey = "";
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
          if (p && typeof p === "object") {
            if ("Internal" in p) internalPeers += 1;
            if ("External" in p) externalPeers += 1;
          }
        }
      }
    }

    return {
      agentId: a.agent_id,
      network,
      nodeKey,
      online,
      height: heights[a.agent_id] ?? null,
      internalPeers,
      externalPeers,
      peers: peerMetrics[a.agent_id] || { clients: 0, validators: 0, total: 0 },
    };
  });

  const sorted = [...rows].sort((a, b) => {
    const { key, dir } = sort;
    const av = a[key];
    const bv = b[key];
    let cmp = 0;
    if (typeof av === "string" && typeof bv === "string") {
      cmp = av.localeCompare(bv);
    } else {
      cmp = av === bv ? 0 : av > bv ? 1 : -1;
    }
    return dir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: keyof AgentRow) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const handleExecute = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Execute ${action} on ${selected.size} agent(s)?`))
      return;

    for (const id of Array.from(selected)) {
      try {
        switch (action) {
          case "kill":
            await api.agents.kill(id);
            break;
          case "status":
            await api.agents.status(id);
            break;
          case "tps":
            await api.agents.tps(id);
            break;
          case "set-log-level": {
            const level = window.prompt("Log level", "info");
            if (level) await api.agents.setLogLevel(id, level);
            break;
          }
          case "set-snarkos-log": {
            const v = window.prompt("Verbosity", "0");
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

  const allSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.agentId));

  const handleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.agentId)));
  };

  const handleDragStart = (index: number) => setDragCol(index);

  const handleDrop = (index: number) => {
    if (dragCol === null || dragCol === index) return;
    setColumns((cols) => {
      const newCols = [...cols];
      const [m] = newCols.splice(dragCol, 1);
      newCols.splice(index, 0, m);
      return newCols;
    });
    setDragCol(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => setDragCol(null);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h2>Agents</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <label>
            ACTION{" "}
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="kill">kill</option>
              <option value="status">status</option>
              <option value="tps">tps</option>
              <option value="set-log-level">set log level</option>
              <option value="set-snarkos-log">set snarkos log level</option>
            </select>
          </label>{" "}
          <button onClick={handleExecute} disabled={selected.size === 0}>
            EXECUTE
          </button>
        </div>
        <div>
          <label>
            REFRESH RATE (sec):{" "}
            <input
              type="number"
              min={1}
              value={refreshRate}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setRefreshRate(Number.isNaN(v) ? 1 : Math.max(1, v));
              }}
              style={{ width: "4em" }}
            />
          </label>
        </div>
      </div>
      <table className="json-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={c.key}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (c.key === "select") handleSelectAll();
                  else if (c.sortable) handleSort(c.key as keyof AgentRow);
                }}
                style={
                  c.key === "select" ||
                  c.key === "network" ||
                  c.key === "online" ||
                  c.key === "height" ||
                  c.key === "internalPeers" ||
                  c.key === "externalPeers" ||
                  c.key === "peers"
                    ? { textAlign: "center" }
                    : undefined
                }
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.agentId}>
              {columns.map((c) => {
                switch (c.key) {
                  case "select":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
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
                    );
                  case "agentId":
                    return (
                      <td key={c.key}>
                        <Link to={`/agents/${r.agentId}`}>{r.agentId}</Link>
                      </td>
                    );
                  case "network":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        {r.network}
                      </td>
                    );
                  case "nodeKey":
                    return <td key={c.key}>{r.nodeKey}</td>;
                  case "online":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "0.6em",
                            height: "0.6em",
                            borderRadius: "50%",
                            backgroundColor: r.online ? "green" : "red",
                          }}
                        />
                      </td>
                    );
                  case "height":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        {r.height ?? "-"}
                      </td>
                    );
                  case "internalPeers":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        {r.internalPeers}
                      </td>
                    );
                  case "externalPeers":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        {r.externalPeers}
                      </td>
                    );
                  case "peers":
                    return (
                      <td key={c.key} style={{ textAlign: "center" }}>
                        {`${r.peers.clients} ${r.peers.validators} ${r.peers.total}`}
                      </td>
                    );
                  default:
                    return null;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ControlPlaneConsole />
    </div>
  );
}
