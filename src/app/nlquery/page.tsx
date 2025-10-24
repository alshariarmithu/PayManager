"use client";

import { useState } from "react";
import {
  Database,
  Sparkles,
  Play,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function NLQueryPage() {
  const [input, setInput] = useState("");
  const [sql, setSql] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSql("");
    setResult([]);

    try {
      const res = await fetch("http://localhost:5001/api/nlquery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");
      console.log(data);
      setSql(data.sql);
      setResult(data.result || []);
    } catch (err) {
      setError("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-gray-700" />
            <h1 className="text-4xl font-bold text-gray-900">
              SQL Query Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Transform natural language into SQL queries
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-semibold mb-3 text-sm text-gray-700">
                <Sparkles className="w-4 h-4" />
                Your Query in Plain English
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Show me all employees with their department names and salaries"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating SQL...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Execute Query
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 rounded-lg p-6 mb-8 border border-red-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <h3 className="font-semibold mb-1 text-red-900">Query Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* SQL Output */}
        {sql && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Generated SQL Query
              </h2>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap break-words text-green-400">
                {sql}
              </pre>
            </div>
          </div>
        )}

        {/* Query Results */}
        {result.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Query Results
              </h2>
              <span className="ml-auto text-sm font-medium text-gray-600">
                {result.length} {result.length === 1 ? "row" : "rows"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(result[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-700"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-6 py-4 text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
