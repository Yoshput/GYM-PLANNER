import { useState, useEffect } from "react";

interface UseExerciseGifResult {
  gifUrl: string | null;
  source: string | null;
  loading: boolean;
  error: string | null;
}

export function useExerciseGif(exerciseName: string): UseExerciseGifResult {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseName) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/exercise-gif?name=${encodeURIComponent(exerciseName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil gambar/gif latihan");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setGifUrl(data.gifUrl);
          setSource(data.source);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Gagal mengambil visual");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exerciseName]);

  return { gifUrl, source, loading, error };
}
