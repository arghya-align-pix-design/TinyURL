"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load data");
      } else {
        setData(json);
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="p-6">Loading stats...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${code}`;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Stats for "{code}"</h1>

      <div className="border p-4 rounded space-y-3">
        <p>
          <strong>Short URL:</strong> 
          <span className="ml-2 text-blue-600 underline">{shortUrl}</span>
        </p>

        <button
          onClick={() => navigator.clipboard.writeText(shortUrl)}
          className="px-3 py-1 bg-gray-600 rounded"
        >
          Copy Short URL
        </button>

        <p>
          <strong>Target URL:</strong>
          <br />
          <a href={data.targetUrl} className="text-blue-600 underline">
            {data.targetUrl}
          </a>
        </p>

        <p>
          <strong>Total Clicks:</strong> {data.totalClicks}
        </p>

        <p>
          <strong>Last Clicked:</strong>{" "}
          {data.lastClicked ? new Date(data.lastClicked).toLocaleString() : "Never"}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block mt-6 text-blue-600 underline"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
