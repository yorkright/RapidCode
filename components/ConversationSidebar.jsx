// /components/ConversationSidebar.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Menu, X } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ConversationSidebar({ onSelectConversation, activeId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch list safelyz
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      // Accept several possible shapes and normalize to array
      if (Array.isArray(data)) setConversations(data);
      else if (Array.isArray(data.conversations)) setConversations(data.conversations);
      else setConversations([]);
    } catch (err) {
      console.error("fetchConversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Create conversation (prompt-based)
  const createConversation = async () => {
    const title = prompt("Enter conversation title:");
    if (!title) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Create failed");
      const conv = await res.json();
      setConversations((s) => [conv, ...s]);
      // auto-open and select
      onSelectConversation?.(conv);
      setOpen(false);
    } catch (err) {
      console.error("createConversation:", err);
      alert("Failed to create conversation");
    }
  };

  // Delete conversation
  const deleteConversation = async (id) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setConversations((s) => s.filter((c) => String(c._id || c.id) !== String(id)));
      // if the deleted one was active, notify parent with null
      if (String(activeId) === String(id)) onSelectConversation?.(null);
    } catch (err) {
      console.error("deleteConversation:", err);
      alert("Failed to delete conversation");
    }
  };

  return (
    <>
  {/* Toggle button (visible always) */}
  <button
    onClick={() => setOpen((v) => !v)}
    className="fixed z-50 p-2 text-white bg-cyan-600 rounded-md shadow-lg top-4 left-4 hover:bg-cyan-700"
    aria-label="Toggle conversations"
  >
    {open ? <X size={18} /> : <Menu size={18} />}
  </button>

  {/* Backdrop */}
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-40 bg-black/50"
      />
    )}
  </AnimatePresence>

  {/* Sidebar panel */}
  <AnimatePresence>
    {open && (
      <motion.aside
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
        className="fixed top-0 left-0 z-50 h-full max-w-full overflow-hidden text-white bg-slate-900 border-r border-cyan-900 shadow-2xl  w-80"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-800">
          <Link href="/">
            <h3 className="text-lg font-semibold text-cyan-400">RapidCode</h3>
          </Link>

          
                       <SignedOut>
                                    </SignedOut>
                    
                                    <SignedIn>
                                      <UserButton afterSignOutUrl="/" />
                                    </SignedIn>

          <div className="flex items-center gap-2">
            <button
              onClick={createConversation}
              className="px-3 py-1 text-sm text-white bg-cyan-600 rounded hover:bg-cyan-700"
            >
              <Plus size={14} /> New 
            </button>
          </div>
        </div>

        

        {/* Conversation List */}
        <div className="flex flex-col h-full p-3">
          {loading ? (
            <div className="flex items-center justify-center flex-1 text-sm text-slate-400">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm text-slate-400">
              No conversations yet
            </div>
          ) : (
            <div className="pr-2 space-y-2 overflow-y-auto">
              {conversations.map((c) => {
                const id = c._id ?? c.id ?? `${c.title}-${Math.random()}`;
                const isActive = String(activeId) === String(id);

                return (
                  <div
                    key={id}
                    onClick={() => {
                      onSelectConversation?.(c);
                      setOpen(false);
                    }}
                    className={`
                      flex items-center justify-between cursor-pointer 
                      px-3 py-2 rounded-md transition
                      ${
                        isActive
                          ? "bg-cyan-700/30 border border-cyan-600"
                          : "hover:bg-slate-800/40"
                      }
                    `}
                  >
                    <div className="pr-2 truncate">
                      <div className="text-sm font-medium text-white">{c.title ?? "Untitled"}</div>
                      <div className="text-xs text-slate-400">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ""}
                      </div>
                    </div>


                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(id);
                      }}
                      className="p-1 ml-3 text-slate-400 transition rounded hover:text-red-400"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.aside>
    )}
  </AnimatePresence>
</>

  );
}
