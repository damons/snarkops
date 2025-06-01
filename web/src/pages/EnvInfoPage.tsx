import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import JsonTable from '../components/JsonTable';

export default function EnvInfoPage() {
  const { envId } = useParams();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (!envId) return;
    api
      .env(envId)
      .info()
      .then(setInfo)
      .catch((e) => console.error(e));
  }, [envId]);

  if (!info) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Environment {envId}</h2>
      <h3>Environment Info (JSON)</h3>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <h3>Environment Info Table</h3>
      <JsonTable data={info} />
      <Link to="/envs">Back to Environments</Link>
    </div>
  );
}
