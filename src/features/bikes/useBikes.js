import { useState, useEffect } from 'react';
import { bikesAPI } from './api';

export function useBikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const data = await bikesAPI.getAll();
      setBikes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  return { bikes, loading, error, refetch: fetchBikes };
}
