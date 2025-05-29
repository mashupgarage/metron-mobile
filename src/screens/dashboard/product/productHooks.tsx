import { useEffect, useState } from "react";
import {
  fetchIsOwned,
  fetchProductRecommendations,
  fetchProductSeriesStatus,
} from "@/src/api/apiEndpoints";

export function useProductOwned(productId: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchIsOwned(productId)
      .then((res) => setData(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading, error };
}

export function useProductSeriesStatus(productId: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductSeriesStatus(productId)
      .then((res) => setData(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading, error };
}

export function useProductRecommendations(productId: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductRecommendations(productId)
      .then((res) => setData(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading, error };
}
