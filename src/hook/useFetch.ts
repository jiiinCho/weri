import { useEffect, useState } from "react";
import axios from "axios";

type Options = {
  url: string;
  params: Record<string, string | number | boolean>;
};

export const useFetch = <T extends Object>({ url, params }: Options) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | undefined>(undefined);

  const fetchData = async () => {
    if (!url || !params) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.request({ method: "get", url, params });
      if (response.data) {
        setData(response.data);
      }
    } catch (fetchError: unknown) {
      setError(JSON.stringify(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  return { data, loading, error, refetch };
};
