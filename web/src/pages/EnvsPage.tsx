import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';


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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div>
        <h2 style={{ textAlign: 'center' }}>Environments</h2>
        <ul style={{ textAlign: 'center', listStyle: 'none', padding: 0 }}>
          {envs.map((e) => (
            <li key={e}>
              <Link to={`/envs/${e}`}>{e}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
