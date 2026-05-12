// app/api/conversations/[id]/route.ts
import Conversation from "../../../../models/Conversation";
import connectToDB from "../../../../lib/mongoose"; // FIX: Changed from { connectToDB } to connectToDB
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// ... rest of your code ...

// ==========================
// 🔐 CHECK AUTH HELPER
// ==========================
async function requireAuth() {
  const { userId } = await auth();  // ✅ MUST await

  if (!userId) {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { error: false, userId };
}

// ==========================
// ✅ GET /api/conversations/[id]
// ==========================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.error) return authCheck.response;

    const { userId } = authCheck;
    const { id } = await context.params;

    await connectToDB();

    const convo = await Conversation.findOne({ _id: id, userId }).lean();

    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(convo);
  } catch (err) {
    console.error("❌ Error fetching conversation:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// ==========================
// ✅ DELETE /api/conversations/[id]
// ==========================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.error) return authCheck.response;

    const { userId } = authCheck;
    const { id } = await context.params;

    await connectToDB();

    const deleted = await Conversation.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json(
        { error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("❌ Error deleting conversation:", err);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
