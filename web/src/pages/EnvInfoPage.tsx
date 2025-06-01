import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

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
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <Link to="/envs">Back to Environments</Link>
    </div>
  );
}
