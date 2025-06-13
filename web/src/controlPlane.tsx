import React, { createContext, useContext, useEffect, useState } from 'react';

const CONTROL_PLANE_URL = (import.meta.env.VITE_CONTROL_PLANE_URL as string) || '';

function wsUrl(): string {
  let base = CONTROL_PLANE_URL || window.location.origin;
  if (base.endsWith('/')) base = base.slice(0, -1);
  return base.replace(/^http/, 'ws') + '/api/v1/events';
}

interface ControlPlaneContextValue {
  events: any[];
}

const ControlPlaneContext = createContext<ControlPlaneContextValue>({ events: [] });

export function ControlPlaneProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl());
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((evts) => [...evts, data]);
      } catch (err) {
        console.error(err);
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <ControlPlaneContext.Provider value={{ events }}>
      {children}
    </ControlPlaneContext.Provider>
  );
}

export function useControlPlane() {
  return useContext(ControlPlaneContext);
}
