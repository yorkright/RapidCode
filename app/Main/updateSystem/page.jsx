"use client";

import React, { useEffect, useState } from "react";

export default function UpdateSystemPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeInstruction, setActiveInstruction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(false);

  // ⚙️ Admin key from environment (make sure it's defined in .env.local)
  const adminKey = process.env.NEXT_PUBLIC_SYSTEM_ADMIN_KEY || "";

  // 🧠 Load current active system instruction
  async function loadActive() {
    setFetching(true);
    try {
      const res = await fetch("/api/system?mode=active&domain=finance");
      const json = await res.json();

      if (json.ok) {
        setActiveInstruction(json.data);
        if (json.data) {
          setTitle(json.data.title || "");
          setContent(json.data.content || "");
        }
      } else {
        console.error("Failed to fetch system instructions:", json.error);
      }
    } catch (err) {
      console.error("Network error while fetching active system:", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadActive();
  }, []);

  // 🚀 Publish new or updated system instruction
  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-system-admin-key": adminKey,
        },
        body: JSON.stringify({
          title: title || `Instruction ${new Date().toISOString()}`,
          content,
          domain: "finance",
          tags: ["finance", "production"],
          activate: true,
          author: "AdminUser",
        }),
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        setMessage("✅ Published and activated successfully!");
        setActiveInstruction(json.data);
      } else {
        setMessage("⚠️ Error: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error publishing system instruction:", err);
      setMessage("❌ Network or server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-2xl font-semibold mb-4">
        🧠 System Instructions (Finance) — Admin Panel
      </h1>

      {/* 🟡 Active Instruction Section */}
      {fetching ? (
        <div className="mb-4 p-4 border rounded text-sm text-gray-600">
          Loading active system instruction...
        </div>
      ) : activeInstruction ? (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Active Version:</span>{" "}
            {activeInstruction.version}
          </div>
          <div className="font-medium text-gray-900">
            {activeInstruction.title}
          </div>
          <pre className="whitespace-pre-wrap mt-2 text-sm bg-gray-100 p-2 rounded">
            {activeInstruction.content}
          </pre>
        </div>
      ) : (
        <div className="mb-4 p-4 border rounded text-sm text-gray-600">
          No active system instruction found.
        </div>
      )}

      {/* ✍️ Update Form */}
      <form onSubmit={handlePublish} className="space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter instruction title"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">
            Content (System Instruction)
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder={"E.g.\nYou are FinAssist, a financial AI advisor..."}
            className="w-full p-2 border rounded mt-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish & Activate"}
          </button>

          <button
            type="button"
            onClick={loadActive}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "Reload Active"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-3 text-sm ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("⚠️")
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
