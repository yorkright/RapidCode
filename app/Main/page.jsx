"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, Mic, MicOff, ImagePlus, X, Code, Terminal, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConversationSidebar from "../../components/ConversationSidebar";
import Loader from "../../components/Loader";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import Image from "next/image";
import HeaderofMainChat from "../../components/HeaderofMainChat";


/* ================= API-CONSTRAINT CONSTANTS (FROM SNIPPET 1) ================= */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Theme
const MAIN_BG = "bg-white";
const SIDEBAR_BG = "bg-slate-50";
const BORDER_COLOR = "border-slate-200";
const HEADER_BG = "bg-white";
const CHAT_TITLE_COLOR = "text-slate-900";

const generateId = (prefix = "msg") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

// 🆕 Copy state
const COPY_TIMEOUT = 1500;

export default function CodeWithAIChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { isLoaded, isSignedIn } = useUser();


  // 🆕 Copy state
  const [copiedId, setCopiedId] = useState(null);

  // 🆕 Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Voice-related state
  const [listening, setListening] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const recordingTimerRef = useRef(null);
  const recordingStartRef = useRef(0);
  const MAX_RECORDING_SEC = 60;
  const [typing, setTyping] = useState(false);
  const micLockRef = useRef(false);
  const recognitionRef = useRef(null);
  const chatRef = useRef(null);
  const controllerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  // Speech synthesis refs/state
  const utterancesRef = useRef({});
  const [speakingId, setSpeakingId] = useState(null);
  const supportsSpeech =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const inputRef = useRef("");
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const textareaRef = useRef(null);
  const autoResizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [input, autoResizeTextarea]);

  /* ---------------- COPY HELPERS (NEW) ---------------- */
  const copyToClipboard = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), COPY_TIMEOUT);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const cleanTextForCopy = (raw = "") => {
    let text = raw;
    text = text.replace(/``````/g, "");
    text = text.replace(/`([^`]+)`/g, "$1");
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");
    text = text.replace(/\*(.*?)\*/g, "$1");
    text = text.replace(/__(.*?)__/g, "$1");
    text = text.replace(/_(.*?)_/g, "$1");
    text = text.replace(/^#+\s*/gm, "");
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
    text = text.replace(/<\/?[^>]+>/g, "");
    text = text.replace(/\n{3,}/g, "\n\n");
    return text.trim();
  };

  // ================= Image handlers (UPDATED FROM SNIPPET 1) =================
  const onSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image size must be under 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Load conversations
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(
            Array.isArray(data.conversations) ? data.conversations : []
          );
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    })();
  }, []);

  
  // Load messages
  useEffect(() => {
    if (!activeConversation?._id) {
      setMessages([]);
      return;
    }

    let mounted = true;
    setMessages([]);

    (async () => {
      try {
        const res = await fetch(
          `/api/messages?conversationId=${activeConversation._id}`
        );
        if (!res.ok) {
          if (mounted) {
            setMessages([
              {
                id: generateId("error"),
                sender: "ai",
                text: "Failed to load chat history.",
              },
            ]);
          }
          return;
        }
        const json = await res.json();
        if (!mounted) return;

        const safeMessages = (json.messages || []).map((m) => ({
          id: m._id || generateId("server"),
          sender: m.role === "user" ? "user" : "ai",
          text: m.content || "",
        }));
        setMessages(safeMessages);

        requestAnimationFrame(() => {
          if (chatRef.current) {
            chatRef.current.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: "auto",
            });
          }
        });
      } catch (err) {
        if (mounted) {
          setMessages([
            {
              id: generateId("error"),
              sender: "ai",
              text: "Error loading chat history.",
            },
          ]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeConversation?._id]);

  // Scroll tracking
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      userScrolledUpRef.current = !nearBottom;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);




  // Sync the user from api/users/sync/route.ts
  
useEffect(() => {
  if (!isLoaded || !isSignedIn) return;

  const syncUser = async () => {
    try {
      console.log("🚀 Syncing user to MongoDB...");

      const res = await fetch("/api/users/sync", {
        method: "POST",
      });

      const data = await res.json();  
      console.log("✅ Sync result:");
      // The data  written after Sync result it actually push the all id details of user in console of browser.
      //So remove it when it depolyed in produnction.
    } catch (err) {
      console.error("❌ Sync failed:", err);
    }
  };

  syncUser();
}, [isLoaded, isSignedIn]);





  // Auto-scroll
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      requestAnimationFrame(() => {
        if (chatRef.current) {
          chatRef.current.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [messages.length]);

  const createConversation = async (title) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const conv = await res.json();
      setConversations((s) => [conv, ...s]);
      setActiveConversation(conv);
      return conv;
    } catch (err) {
      console.error("createConversation error:", err);
      throw err;
    }
  };

  const typeTextGradually = useCallback(
    async (fullText, aiMsgId) => {
      setTyping(true);
      let currentText = "";

      const fullLength = fullText.length;
      let chunkSize = 10;
      let delay = 20;

      if (fullLength > 800) {
        chunkSize = 30;
        delay = 5;
      } else if (fullLength > 300) {
        chunkSize = 15;
        delay = 10;
      }

      for (let i = 0; i < fullText.length; i += chunkSize) {
        const chunk = fullText.substring(i, i + chunkSize);
        currentText += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: currentText } : m))
        );
        await new Promise((r) => setTimeout(r, delay));
      }

      setTyping(false);

      if (!userScrolledUpRef.current && chatRef.current) {
        requestAnimationFrame(() => {
          if (chatRef.current) {
            chatRef.current.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        });
      }
    },
    [userScrolledUpRef]
  );

  const handleSend = useCallback(async () => {
    const text = inputRef.current.trim();
    if (!text && !imageFile) return;

    setInput("");
    inputRef.current = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Clear image UI state after capturing current imageFile from closure
    const currentImage = imageFile;
    setImageFile(null);
    setImagePreview(null);

    const userId = generateId("user");
    const aiId = generateId("ai");
    const controller = new AbortController();
    controllerRef.current = controller;

    setMessages((prev) => [
      ...prev,
      { id: userId, sender: "user", text },
      { id: aiId, sender: "ai", text: "" },
    ]);
    setSending(true);

    try {
      let res;

      if (currentImage) {
        // Image + Text → FormData
        const formData = new FormData();
        formData.append("message", text);
        if (activeConversation?._id)
          formData.append("conversationId", activeConversation._id);
        formData.append("image", currentImage);

        res = await fetch("/api/chat", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } else {
        // Text only → JSON
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationId: activeConversation?._id,
          }),
          signal: controller.signal,
        });
      }

      if (!res.ok) {
        // ✅ Handle rate limit separately for better UX
        if (res.status === 429) {
          throw new Error(
            "You're sending messages too fast. Please wait 30 seconds and try again."
          );
        }

        let errText = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          errText = errJson?.error || errText;
        } catch (e) {}

        throw new Error(`Failed to connect to AI: ${errText}`);
      }

      const newId = res.headers.get("X-Conversation-Id");
      let pendingConversation = null;
      if (newId && (!activeConversation || activeConversation._id !== newId)) {
        const titleSeed = text || "Image";
        pendingConversation = {
          _id: newId,
          title: titleSeed.slice(0, 50) + (titleSeed.length > 50 ? "..." : ""),
        };
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) fullResponse += decoder.decode(value, { stream: true });
      }

      await typeTextGradually(fullResponse, aiId);

      if (pendingConversation) {
        setActiveConversation(pendingConversation);
        setConversations((s) => {
          if (s.find((c) => c._id === pendingConversation._id)) return s;
          return [pendingConversation, ...s];
        });
      }
    } catch (err) {
      
      let errorText;

      if (err.name === "AbortError") {
        errorText = "Response stopped by user.";
      } else if (err.message?.includes("Internal Server Error")) {
        errorText =
          "The AI service is temporarily unavailable. Please try again in a moment.";
      } else {
        errorText = err.message || "Something went wrong. Please try again.";
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? { ...msg, text: (msg.text || "") + `\n\n**ERROR:** ${errorText}` }
            : msg
        )
      );
    } finally {
      setSending(false);
      controllerRef.current = null;
    }
  }, [activeConversation, typeTextGradually, imageFile]);

  const handleSendFixed = useCallback(() => {
    const recognition = recognitionRef.current;
    if (listening && recognition) {
      recognition.manualStop = true;
      try {
        recognition.stop();
      } catch (e) {}
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingElapsed(0);
    handleSend();
  }, [handleSend, listening]);

  const cancelResponse = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort();
    setSending(false);
    setTyping(false);
  }, []);


  
  // Voice input setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      recordingStartRef.current = Date.now();
      setRecordingElapsed(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - recordingStartRef.current) / 1000
        );
        setRecordingElapsed(elapsed);
        if (elapsed >= MAX_RECORDING_SEC) {
          try {
            recognition.manualStop = true;
            recognition.stop();
          } catch (e) {}
        }
      }, 250);
    };

    recognition.onend = () => {
      setListening(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      recordingStartRef.current = 0;
      setRecordingElapsed(0);
      recognition.manualStop = false;
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setListening(false);
      setRecordingElapsed(0);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      inputRef.current = transcript;
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, []);

  const toggleMic = async () => {
    if (micLockRef.current) return;
    micLockRef.current = true;
    setTimeout(() => {
      micLockRef.current = false;
    }, 300);

    const recognition = recognitionRef.current;
    if (!recognition) {
      console.warn("SpeechRecognition not supported.");
      return;
    }

    if (!listening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        recognition.manualStop = false;
        recognition.start();
      } catch (err) {
        console.warn("Microphone access denied.", err);
      } finally {
        micLockRef.current = false;
      }
    } else {
      recognition.manualStop = true;
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Stop recognition failed", e);
      } finally {
        micLockRef.current = false;
      }
    }
  };

  const recordingProgress = Math.min(
    100,
    Math.round((recordingElapsed / MAX_RECORDING_SEC) * 100)
  );

  // MODIFIED: Clean text for speech - ONLY text, numbers, and math terms
  const cleanTextForSpeech = (raw = "") => {
    let text = raw;

    text = text.replace(/``````/g, "");
    text = text.replace(/`[^`]*`/g, "");
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");
    text = text.replace(/\*(.*?)\*/g, "$1");
    text = text.replace(/__(.*?)__/g, "$1");
    text = text.replace(/_(.*?)_/g, "$1");
    text = text.replace(/^#+\s*/gm, "");
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
    text = text.replace(/!\[(.*?)\]\((.*?)\)/g, "");
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    text = text.replace(/\bextract[: ]/gi, "");

    const mathSafeChars = /[^a-zA-Z0-9\s+\-*/=().%,$€£¥]+/g;
    text = text.replace(mathSafeChars, " ");

    text = text.replace(/\s{2,}/g, " ");
    text = text.replace(/\n{2,}/g, " ");

    return text.trim();
  };

  // Speech helpers (manual play/stop per AI bubble)
  const playVoice = useCallback((id, text) => {
    if (!supportsSpeech) {
      console.warn("SpeechSynthesis not supported in this browser.");
      return;
    }

    const speakable = cleanTextForSpeech(text || "");
    if (!speakable) return;

    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    const utter = new SpeechSynthesisUtterance(speakable);
    utter.lang = "en-US";

    utter.onstart = () => {
      utterancesRef.current[id] = utter;
      setSpeakingId(id);
    };
    utter.onend = () => {
      delete utterancesRef.current[id];
      setSpeakingId((cur) => (cur === id ? null : cur));
    };
    utter.onerror = () => {
      delete utterancesRef.current[id];
      setSpeakingId((cur) => (cur === id ? null : cur));
    };

    utterancesRef.current[id] = utter;

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Failed to start speech:", e);
      delete utterancesRef.current[id];
      setSpeakingId(null);
    }
  }, []);

  const stopVoice = useCallback((id) => {
    if (!supportsSpeech) return;

    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Failed to stop speech:", e);
    } finally {
      delete utterancesRef.current[id];
      setSpeakingId((cur) => (cur === id ? null : cur));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supportsSpeech) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    };
  }, []);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Loader />
      <h3 className="mt-8 mb-2 text-xl font-semibold text-slate-900">
        Start a Conversation
      </h3>
    </div>
  );

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className={`flex flex-col md:flex-row h-screen ${SIDEBAR_BG}`}>
          <div className="w-full border-b md:w-auto md:shrink-0 md:border-b-0 md:border-r border-slate-200">
            <ConversationSidebar
              onSelectConversation={(c) => setActiveConversation(c)}
              activeId={activeConversation?._id}
              createConversation={createConversation}
            />
          </div>

          <main className={`flex-1 flex flex-col ${MAIN_BG} min-h-0`}>
            <div className={`${HEADER_BG} border-b ${BORDER_COLOR} shrink-0`}>
              <HeaderofMainChat
                title={activeConversation?.title || "RapidCode AI Assistant"}
                chatTitleColor={CHAT_TITLE_COLOR}
              />
            </div>

            <div
              ref={chatRef}
              className="relative flex-1 min-h-0 p-4 overflow-y-auto sm:p-6"
            >
              {!activeConversation && messages.length === 0 ? (
                <div className="h-full">
                  <EmptyState />
                </div>
              ) : (
                <div className="w-full max-w-full pt-4 pb-24 mx-auto space-y-4 sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl sm:pt-6 sm:pb-28">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isUser = msg.sender === "user";
                      const bubbleColor = isUser
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-slate-900 border border-slate-100 shadow-lg";

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`group p-3 sm:p-4 rounded-xl max-w-[95%] sm:max-w-[85%] shadow-sm ${bubbleColor} relative`}
                          >
                            <div className="prose-sm prose max-w-none wrap-break-word">
                              {!isUser && (
                                <div className="flex items-center mb-2 space-x-2">
                                  <Image
                                    src="/Logo01.png" 
                                    alt="AI"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                  <span className="font-semibold text-cyan-600">
                                    RapidCode
                                  </span>
                                </div>
                              )}

                              {isUser ? (
                                <p className="whitespace-pre-wrap">
                                  {msg.text}
                                </p>
                              ) : (
                                <MarkdownRenderer text={msg.text} />
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2 text-xs">
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    msg.id,
                                    isUser
                                      ? msg.text
                                      : cleanTextForCopy(msg.text)
                                  )
                                }
                                className={`px-2 py-1 rounded border transition ${
                                  isUser
                                    ? "border-cyan-300 bg-cyan-500/40 hover:bg-cyan-500/60 text-white"
                                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                                }`}
                              >
                                {copiedId === msg.id ? "Copied" : "Copy"}
                              </button>

                              {!isUser && (
                                <div className="flex items-center space-x-2">
                                  {speakingId === msg.id ? (
                                    <button
                                      onClick={() => stopVoice(msg.id)}
                                      aria-label="Stop voice playback"
                                      className="px-2 py-1 text-red-600 border border-red-100 rounded bg-red-50 hover:bg-red-100"
                                    >
                                      Stop
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        playVoice(msg.id, msg.text)
                                      }
                                      aria-label="Play voice playback"
                                      className="px-2 py-1 border rounded bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                    >
                                      Play
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {typing && (
                    <div className="flex justify-start">
                      <div className="p-3 sm:p-4 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-lg max-w-[95%] sm:max-w-[85%]">
                        <div className="wave-container flex items-center h-5 space-x-1.5">
                          <div className="w-1 h-3 rounded-full wave animate-wave-1 bg-cyan-500"></div>
                          <div className="w-1 h-3 rounded-full wave animate-wave-2 bg-cyan-500"></div>
                          <div className="w-1 h-3 rounded-full wave animate-wave-3 bg-cyan-500"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`w-full p-4 sm:p-6 border-t ${BORDER_COLOR} shrink-0 bg-white`}
            >
              {sending && (
                <div className="mb-2 text-center">
                  <button
                    onClick={cancelResponse}
                    className="text-xs text-red-500 transition duration-150 hover:text-red-700"
                  >
                    Stop Generating
                  </button>
                </div>
              )}
              {listening && (
                <div className="mb-2 text-xs font-medium text-center text-red-500">
                  Listening... ({recordingElapsed}s / {MAX_RECORDING_SEC}s)
                </div>
              )}

              {/* Image preview */}
              {imagePreview && (
                <div className="relative w-32 mb-2">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="border rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="relative w-full max-w-2xl mx-auto lg:max-w-4xl">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendFixed();
                    }
                  }}
                  disabled={sending}
                  rows={1}
                  placeholder="Ask a coding question or paste a snippet..."
                  className={`
                    w-full bg-gray-50 text-gray-900 rounded-2xl sm:rounded-3xl
                    py-2.5 sm:py-3 pr-28 sm:pr-32 pl-3 sm:pl-4 shadow-md
                    focus:outline-none focus:shadow-lg transition-all duration-200
                    resize-none overflow-hidden
                    ${sending ? "opacity-60 cursor-not-allowed" : "cursor-text"}
                  `}
                />

                {/* Image upload button */}
                <label
                  className={`
                    absolute right-20 sm:right-24 top-1/2 -translate-y-1/2
                    p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer
                    text-cyan-600 hover:text-cyan-500
                    ${sending ? "opacity-50 pointer-events-none" : ""}
                  `}
                  aria-label="Upload image"
                >
                  <ImagePlus size={20} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={onSelectImage}
                  />
                </label>

                <button
                  onClick={(e) => {
                    if (e.detail === 0) return;
                    toggleMic();
                  }}
                  disabled={sending}
                  className={`
                    absolute right-11 sm:right-12 top-1/2 -translate-y-1/2 
                    p-1.5 sm:p-2 rounded-full transition-all duration-200
                    ${
                      listening
                        ? "bg-red-500/10 text-red-500"
                        : "text-cyan-600 hover:text-cyan-500"
                    }
                  `}
                >
                  <div className="relative mt-5 mr-2">
                    <Mic
                      size={20}
                      className={listening ? "opacity-0" : "opacity-100"}
                    />
                    <MicOff
                      size={20}
                      className={
                        listening
                          ? "opacity-100 absolute top-0 left-0"
                          : "opacity-0"
                      }
                    />
                    {listening && (
                      <svg
                        className="absolute inset-0 w-full h-full transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-red-500 opacity-30"
                          d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          className="text-red-500 transition-all duration-100 ease-linear"
                          d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${recordingProgress}, 100`}
                        />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleSendFixed}
                  disabled={(!input.trim() && !imageFile) || sending}
                  className={`
                    absolute right-1 sm:right-1 top-1/2 -translate-y-1/2
                    p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white
                    transition-all duration-300
                    ${
                      (!input.trim() && !imageFile) || sending
                        ? "bg-cyan-600/50 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700 shadow-lg"
                    }
                  `}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>

              <p className="text-[10px] sm:text-xs text-center text-slate-500 mt-2 sm:mt-3">
                Shift + Enter for newline
              </p>

              <style jsx>{`
                .wave {
                  background: rgba(16, 185, 129, 0.95);
                  display: inline-block;
                  height: 100%;
                  width: 3px;
                  margin: 0 1px;
                  border-radius: 2px;
                }
                .wave-container {
                  height: 12px;
                }
                @keyframes wave1 {
                  0% {
                    transform: scaleY(0.4);
                    opacity: 0.5;
                  }
                  50% {
                    transform: scaleY(0.95);
                    opacity: 1;
                  }
                  100% {
                    transform: scaleY(0.4);
                    opacity: 0.5;
                  }
                }
                @keyframes wave2 {
                  0% {
                    transform: scaleY(0.9);
                    opacity: 0.95;
                  }
                  50% {
                    transform: scaleY(0.3);
                    opacity: 0.45;
                  }
                  100% {
                    transform: scaleY(0.9);
                    opacity: 0.95;
                  }
                }
                @keyframes wave3 {
                  0% {
                    transform: scaleY(0.3);
                    opacity: 0.45;
                  }
                  50% {
                    transform: scaleY(0.9);
                    opacity: 0.95;
                  }
                  100% {
                    transform: scaleY(0.3);
                    opacity: 0.45;
                  }
                }
                .animate-wave-1 {
                  animation: wave1 600ms infinite ease-in-out;
                }
                .animate-wave-2 {
                  animation: wave2 600ms infinite ease-in-out;
                  animation-delay: 150ms;
                }
                .animate-wave-3 {
                  animation: wave3 600ms infinite ease-in-out;
                  animation-delay: 300ms;
                }
              `}</style>
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
