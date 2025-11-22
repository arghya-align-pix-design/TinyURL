"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all links on load
  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setUrl("");
      setCode("");
      fetchLinks();
    }

    setLoading(false);
  };

  const handleDelete = async (shortCode: string) => {
    await fetch(`/api/links/${shortCode}`, {
      method: "DELETE",
    });

    fetchLinks();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TinyLink Dashboard</h1>

      {/* Add new link */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 p-4 rounded border"
      >
        <input
          type="text"
          placeholder="Enter long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Custom code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-2 border rounded"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>

      {/* Links table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Your Links</h2>

        {links.length === 0 ? (
          <p>No links created yet.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Code</th>
                <th className="p-2 border">URL</th>
                <th className="p-2 border">Clicks</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {links.map((link: any) => (
                <tr key={link.code}>
                  <td className="border p-2">{link.code}</td>

                  <td className="border p-2 truncate max-w-xs">
                    <a
                      href={`/code/${link.code}`}
                      className="text-blue-600 underline"
                    >
                      {link.targetUrl}
                    </a>
                  </td>

                  <td className="border p-2">{link.totalClicks}</td>

                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_BASE_URL}/${link.code}`
                        )
                      }
                      className="px-2 py-1 bg-gray-500 rounded"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => handleDelete(link.code)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
