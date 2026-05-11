// ✅ app/api/system/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import SystemInstruction from "../../../models/SystemInstruction";

const ADMIN_KEY = process.env.SYSTEM_ADMIN_KEY;

async function ensureDb() {
  try {
    await connectToDB();
    console.log("✅ MongoDB connected for /api/system");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

// ✅ GET SYSTEM INSTRUCTIONS
export async function GET(req: NextRequest) {
  await ensureDb();

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");
  const domain = url.searchParams.get("domain") || undefined;

  try {
    if (mode === "active") {
      const query: any = { active: true };
      if (domain) query.domain = domain;

      const active = await SystemInstruction.findOne(query)
        .sort({ version: -1 })
        .lean();

      return NextResponse.json(
        { ok: true, data: active || null },
        { status: 200 }
      );
    }

    const limit = Number(url.searchParams.get("limit") || 20);
    const listQuery: any = {};
    if (domain) listQuery.domain = domain;

    const list = await SystemInstruction.find(listQuery)
      .sort({ version: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ ok: true, data: list }, { status: 200 });
  } catch (error) {
    console.error("GET /api/system error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ CREATE OR UPDATE SYSTEM INSTRUCTIONS (Admin protected)
export async function POST(req: NextRequest) {
  await ensureDb();

  const authHeader = req.headers.get("x-system-admin-key");

  // ✅ Log keys to verify mismatch during local dev (remove in production)
  if (!ADMIN_KEY) {
    console.error("❌ SYSTEM_ADMIN_KEY is not set in environment variables");
  } else if (authHeader !== ADMIN_KEY) {
    console.warn(
      `🚫 Unauthorized: key mismatch. Sent="${authHeader}", Expected="${ADMIN_KEY}"`
    );
  }

  if (!authHeader || !ADMIN_KEY || authHeader !== ADMIN_KEY) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      title,
      content,
      domain = "finance",
      tags = [],
      activate = false,
      author,
    } = body;

    if (!content || !title) {
      return NextResponse.json(
        { ok: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const latest = await SystemInstruction.findOne({ domain })
      .sort({ version: -1 })
      .lean();
    const newVersion = (latest?.version || 0) + 1;

    if (activate) {
      await SystemInstruction.updateMany(
        { domain, active: true },
        { $set: { active: false } }
      );
    }

    const doc = new SystemInstruction({
      title,
      content,
      domain,
      tags,
      author,
      active: !!activate,
      version: newVersion,
      metadata: {
        createdBy: author || "admin",
        createdAt: new Date(),
      },
    });

    await doc.save();

    console.log(`✅ SystemInstruction v${newVersion} saved for domain: ${domain}`);
    return NextResponse.json({ ok: true, data: doc }, { status: 201 });
  } catch (error) {
    console.error("POST /api/system error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
