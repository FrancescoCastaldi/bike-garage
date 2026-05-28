import { useState, useEffect } from 'react';
import { activitiesAPI } from '../services/api';

export function useActivities(bikeId = null) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activitiesAPI.getAll(bikeId);
      setActivities(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [bikeId]);

  return { activities, loading, error, refetch: fetchActivities };
}
