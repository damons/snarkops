import { useEffect, useState } from 'react';
import { Snops } from 'snops_sdk';

const api = new Snops('');

export default function EnvsPage() {
  const [envs, setEnvs] = useState<string[]>([]);

  useEffect(() => {
    api
      .env()
      .list()
      .then(setEnvs)
      .catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <h2>Environments</h2>
      <ul>
        {envs.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
