import { useCallback, useState } from "react";
import axios from "axios";

type Options = {
  url: string;
  params: Record<string, string | number | boolean>;
};

export const useFetch = <T extends Object>({ url, params }: Options) => {
  // const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<unknown | undefined>(undefined);

  const fetch = useCallback(async (): Promise<T> => {
    let data;
    setLoading(true);
    try {
      const response = await axios.request({ method: "get", url, params });
      // setData(response.data);
      data = response.data;
    } catch (error: unknown) {
      setErrors(JSON.stringify(error));
    } finally {
      setLoading(false);
    }

    return data;
  }, [params, url]);

  const refetch = () => {
    setLoading(true);
    fetch();
  };

  return { loading, errors, refetch, fetch };
};
