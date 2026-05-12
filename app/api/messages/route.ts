// app/api/messages/route.ts
import { NextResponse } from "next/server";
// app/api/messages/route.ts
import Message, { IMessage } from "../../../models/Message";
import Conversation from "../../../models/Conversation";
import connectToDB from "../../../lib/mongoose"; // FIX: Changed from { connectToDB } to connectToDB
import { auth } from "@clerk/nextjs/server";
/**
 * 🔐 AUTH HELPER (async fix)
 */
async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { error: false, userId };
}

/**
 * ==========================================
 * ✅ GET /api/messages?conversationId=123
 * ==========================================
 */
export async function GET(req: Request) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.error) return authCheck.response;

    const { userId } = authCheck;
    await connectToDB();

    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId required" },
        { status: 400 }
      );
    }

    // Verify user owns this conversation
    const convo = await Conversation.findOne({ _id: conversationId, userId });
    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * ==========================================
 * ✅ POST /api/messages
 * BODY: { conversationId, role, content }
 * ==========================================
 */

export async function POST(req: Request) {
  try {
    const authCheck = requireAuth();
    if ((await authCheck).error) return (await authCheck).response;

    const { userId } = await auth();

    await connectToDB();
    const body = await req.json();

    const { conversationId, role, content } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: "conversationId, role and content required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const convo = await Conversation.findOne({ _id: conversationId, userId });
    if (!convo) {
      return NextResponse.json(
        { error: "Unauthorized or conversation not found" },
        { status: 403 }
      );
    }

    const newMessage: IMessage = await Message.create({
      conversationId,
      role,
      content,
    });

    convo.messages.push(newMessage._id as any);
    await convo.save();

    return NextResponse.json(
      { success: true, message: newMessage },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating message:", err);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
