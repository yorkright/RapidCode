// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Conversation from "../../../models/Conversation";
import { connectToDB } from "../../../lib/mongoose";

// ========================
// GET → Fetch all user conversations
// ========================
export async function GET() {
  try {
    const { userId } = await auth(); // ✅ FIXED: auth() must be awaited

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const conversations = await Conversation.find({ userId }).sort({
      updatedAt: -1,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}


// ========================
// POST → Create new conversation
// ========================
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // ✅ FIXED: auth() must be awaited

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || "").toString().trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const convo = await Conversation.create({
      title,
      userId, // save conversation for this logged-in user
    });

    return NextResponse.json(convo, { status: 201 });
  } catch (err) {
    console.error("POST /conversations error:", err);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
