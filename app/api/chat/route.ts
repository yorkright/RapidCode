// app/api/chat/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDB from "../../../lib/mongoose"; // FIX: Changed from { connectToDB } to connectToDB
import Conversation from "../../../models/Conversation";
import Message from "../../../models/Message";
import SystemInstruction from "../../../models/SystemInstruction";

// ... rest of your code ...

import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

// ===================================================
// Initialize Gemini
// ===================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ===================================================
// Rate Limiting
// ===================================================
const RATE_LIMIT = 5;
const RATE_WINDOW = 30_000; // 30 seconds
const userRateMap = new Map<string, number[]>();

function isRateLimited(userId: string) {
  const now = Date.now();
  const timestamps = userRateMap.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);

  if (recent.length >= RATE_LIMIT) return true;

  recent.push(now);
  userRateMap.set(userId, recent);
  return false;
}

// ===================================================
// Cache for system prompt
// ===================================================
let cachedPrompt: string | null = null;
let cachedHash: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 10;

function computeHash(data: string | Buffer) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ===================================================
// Default System Prompt (Fallback)
// ===================================================
const DEFAULT_SYSTEM_PROMPT = `You are a highly knowledgeable and helpful coding assistant with expertise in:
- Web development (HTML, CSS, JavaScript, React, Next.js)
- Backend development (Node.js, Express, APIs)
- Database design (MongoDB, SQL)
- DevOps and deployment
- Best practices and code quality

Your responsibilities:
1. Provide clear, concise, and accurate code explanations
2. Suggest improvements and best practices
3. Help debug code and identify issues
4. Explain concepts in an easy-to-understand manner
5. Provide working code examples when appropriate
6. Ask clarifying questions when needed

Always:
- Write clean, readable code
- Follow industry standards
- Consider performance and security
- Explain your reasoning
- Be respectful and encouraging

If you don't know something, say so and suggest where to find the answer.`;

// ===================================================
// Load System Instructions
// ===================================================
async function loadSystemPrompt(domain = "coding"): Promise<string> {
  try {
    await connectToDB();

    const now = Date.now();
    if (cachedPrompt && now - lastCacheTime < CACHE_TTL) {
      console.log("[SYSTEM PROMPT] Using cached prompt");
      return cachedPrompt;
    }

    try {
      const records = await SystemInstruction.find({ domain, active: true })
        .sort({ version: -1 })
        .limit(1)
        .lean();

      if (records && records.length > 0) {
        const text = records
          .map(
            (r) =>
              `### Instruction v${r.version}: ${r.title}\n${r.content.trim()}\n\n`
          )
          .join("")
          .trim();

        const hash = computeHash(text);
        if (cachedHash === hash && cachedPrompt) {
          console.log("[SYSTEM PROMPT] Hash matched, using cached prompt");
          return cachedPrompt;
        }

        cachedPrompt = text;
        cachedHash = hash;
        lastCacheTime = now;

        console.log("[SYSTEM PROMPT] Loaded from database - domain:", domain, "version:", records[0].version);
        return text;
      } else {
        console.warn("[SYSTEM PROMPT] No active instructions found for domain:", domain, "- Using default prompt");
        cachedPrompt = DEFAULT_SYSTEM_PROMPT;
        cachedHash = computeHash(DEFAULT_SYSTEM_PROMPT);
        lastCacheTime = now;
        return DEFAULT_SYSTEM_PROMPT;
      }
    } catch (dbQueryError: any) {
      console.error("[SYSTEM PROMPT] Database query error:", dbQueryError?.message || dbQueryError);
      console.warn("[SYSTEM PROMPT] Falling back to default prompt");
      cachedPrompt = DEFAULT_SYSTEM_PROMPT;
      cachedHash = computeHash(DEFAULT_SYSTEM_PROMPT);
      lastCacheTime = now;
      return DEFAULT_SYSTEM_PROMPT;
    }
  } catch (connectionError: any) {
    console.error("[SYSTEM PROMPT] Connection error:", connectionError?.message || connectionError);
    console.warn("[SYSTEM PROMPT] Falling back to default prompt");
    return DEFAULT_SYSTEM_PROMPT;
  }
}

// ===================================================
// Generate AI Chat Title
// ===================================================
async function generateChatTitle(userMsg: string, aiMsg: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a short, clear chat title (max 6 words).
Topic: Programming assistance
User Input: ${userMsg}
Title:`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 20 },
    });

    return result.response.text().replace(/["\n]/g, "").trim();
  } catch {
    return null;
  }
}

// ===================================================
// POST /api/chat
// ===================================================
export async function POST(req: Request) {
  // NEW: Initialize AbortController to handle client disconnects
  const abortController = new AbortController();
  
  // Link the request's signal to our local abort controller
  req.signal.addEventListener("abort", () => {
    abortController.abort();
  });

  try {
    // ================= Database Connection =================
    try {
      await connectToDB();
    } catch (dbError: any) {
      console.error("[CHAT API] Database Connection Error:", dbError?.message || dbError);
      return NextResponse.json(
        { 
          error: "Database connection failed", 
          details: dbError?.message || "Unknown database error"
        },
        { status: 500 }
      );
    }

    // ================= Auth =================
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult?.userId || null;
    } catch (authError: any) {
      console.error("[CHAT API] Auth Error:", authError?.message || authError);
      return NextResponse.json(
        { error: "Authentication failed", details: authError?.message || "Unknown auth error" },
        { status: 401 }
      );
    }

    if (!userId) {
      console.warn("[CHAT API] No user ID found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ================= Rate Limit =================
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429, headers: { "Retry-After": "30" } }
      );
    }

    // ================= Detect request type =================
    const contentType = req.headers.get("content-type") || "";
    let message = "";
    let conversationId: string | undefined;
    let imageBase64: string | null = null;
    let imageMime: string | null = null;

    try {
      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        message = String(formData.get("message") || "").trim();
        conversationId = String(formData.get("conversationId") || "") || undefined;

        const image = formData.get("image") as File | null;
        if (image) {
          if (image.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
          }
          if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
            return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
          }
          const buffer = Buffer.from(await image.arrayBuffer());
          imageBase64 = buffer.toString("base64");
          imageMime = image.type;
        }
      } else {
        const body = await req.json();
        message = (body.message || "").trim();
        conversationId = body.conversationId;
      }
    } catch (parseError: any) {
      console.error("[CHAT API] Request Parsing Error:", parseError?.message || parseError);
      return NextResponse.json(
        { error: "Invalid request format", details: parseError?.message },
        { status: 400 }
      );
    }

    if (!message) {
      console.warn("[CHAT API] Empty message received");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // ================= System Prompt =================
    let systemPrompt: string;
    try {
      systemPrompt = await loadSystemPrompt("coding");
    } catch (promptError: any) {
      console.error("[CHAT API] Unexpected system prompt error:", promptError?.message || promptError);
      // Even with fallback, this should rarely throw
      return NextResponse.json(
        { error: "Failed to initialize system prompt", details: promptError?.message },
        { status: 500 }
      );
    }

    // ================= Conversation =================
    let conversation;
    try {
      conversation = 
        conversationId &&
        (await Conversation.findOne({ _id: conversationId, userId }));

      const isNewConversation = !conversation;

      if (!conversation) {
        conversation = await Conversation.create({
          title: "New Chat",
          userId,
        });
      }
    } catch (convError: any) {
      console.error("[CHAT API] Conversation Handling Error:", convError?.message || convError);
      return NextResponse.json(
        { error: "Failed to manage conversation", details: convError?.message },
        { status: 500 }
      );
    }

    if (!conversation) {
      console.error("[CHAT API] Conversation is null after creation");
      return NextResponse.json(
        { error: "Failed to create or find conversation" },
        { status: 500 }
      );
    }

    const isNewConversation = !conversationId || conversationId !== conversation._id.toString();

    // ================= Load History (TOKEN CONTROL) =================
    let limitedHistory;
    try {
      const MAX_HISTORY = 12;

      const history = await Message.find({
        conversationId: conversation._id,
      })
        .sort({ createdAt: 1 })
        .select("role content -_id")
        .lean();

      limitedHistory = history.slice(-MAX_HISTORY);
    } catch (historyError: any) {
      console.error("[CHAT API] History Loading Error:", historyError?.message || historyError);
      limitedHistory = [];
    }

    // Save user message
    try {
      await Message.create({
        conversationId: conversation._id,
        userId,
        role: "user",
        content: message.slice(0, 50000),
      });
    } catch (msgError: any) {
      console.error("[CHAT API] Failed to save user message:", msgError?.message || msgError);
      // Don't return here - continue with the response
    }

    const geminiHistory: Content[] = limitedHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // ================= Final Gemini Contents =================
    const userParts: any[] = [{ text: message }];

    if (imageBase64 && imageMime) {
      userParts.push({
        inlineData: { data: imageBase64, mimeType: imageMime },
      });
    }

    const finalContents: Content[] = [
      ...geminiHistory,
      { role: "user", parts: userParts },
    ];

    // ================= Initialize Gemini Model =================
    let model;
    let result;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }

      model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      // UPDATED: Pass the abort signal to Gemini's SDK
      result = await model.generateContentStream({
        contents: finalContents,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 65000,
        },
      }, {
        signal: abortController.signal
      });
    } catch (geminiError: any) {
      console.error("[CHAT API] Gemini Model Initialization Error:", geminiError?.message || geminiError);
      return NextResponse.json(
        { 
          error: "Failed to initialize AI model",
          details: geminiError?.message || "Check GEMINI_API_KEY environment variable"
        },
        { status: 500 }
      );
    }

    // ================= Streaming =================
    const encoder = new TextEncoder();
    let aiReply = "";
    let buffer = "";
    const BATCH_SIZE = 60;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            // NEW: Explicit check if client has disconnected during generation
            if (abortController.signal.aborted) {
              console.log("[CHAT API] ✓ Stream aborted by client");
              return; 
            }

            try {
              const text =
                typeof (chunk as any).text === "function"
                  ? (chunk as any).text()
                  : (chunk as any).text ?? "";

              if (text) {
                aiReply += text;
                buffer += text;

                if (buffer.length >= BATCH_SIZE) {
                  controller.enqueue(encoder.encode(buffer));
                  buffer = "";
                }
              }
            } catch (chunkError: any) {
              console.error("[CHAT API] Error processing chunk:", chunkError?.message || chunkError);
              // Continue to next chunk instead of failing
            }
          }

          if (buffer.length) controller.enqueue(encoder.encode(buffer));

          // Only save to DB if the request wasn't aborted
          if (aiReply.trim() && !abortController.signal.aborted) {
            try {
              await Message.create({
                conversationId: conversation._id,
                userId,
                role: "assistant",
                content: aiReply.trim().slice(0, 50000),
              });

              if (isNewConversation) {
                const title =
                  (await generateChatTitle(message, aiReply)) ||
                  message.slice(0, 60);

                await Conversation.updateOne(
                  { _id: conversation._id },
                  { title }
                );
              }
            } catch (saveError: any) {
              console.error("[CHAT API] Error saving AI message to DB:", saveError?.message || saveError);
              // Don't fail the stream - message was already sent to client
            }
          }
        } catch (streamError: any) {
          console.error("[CHAT API] Stream Processing Error:", streamError?.message || streamError);
          // Do not send error message if it's a deliberate abort
          if (!abortController.signal.aborted) {
            controller.enqueue(
              encoder.encode("\n\n⚠️ AI response interrupted: " + (streamError?.message || "Unknown error"))
            );
          }
        } finally {
          controller.close();
        }
      },
      // Ensure local abort controller is triggered if the ReadableStream is canceled
      cancel() {
        console.log("[CHAT API] ReadableStream canceled by client");
        abortController.abort();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": conversation._id.toString(),
        "Cache-Control": "no-cache; no-transform",
      },
    });
  } catch (err: any) {
    console.error("[CHAT API] Unhandled Error:", err?.message || err);
    console.error("[CHAT API] Error Stack:", err?.stack || "No stack trace available");
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: err?.message || "An unexpected error occurred",
        type: err?.constructor?.name || "Unknown"
      },
      { status: 500 }
    );
  }
}
