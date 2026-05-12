// app/api/users/sync/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectToDB from "../../../../lib/mongoose"; // FIX: Changed from { connectToDB } to connectToDB
import User from "../../../../models/User";

// ... rest of your code ...

/**
 * POST /api/users/sync
 * Syncs current Clerk user to MongoDB
 */
export async function POST(req: Request) {
  try {
    console.log("========== 📍 POST /api/users/sync START ==========");

    // Step 1: Get auth info
    const { userId } = await auth();
    console.log("Step 1 - userId from auth():", userId);

    if (!userId) {
      console.error("❌ FAILED: No userId found");
      return NextResponse.json(
        { success: false, error: "Unauthorized - no userId" },
        { status: 401 }
      );
    }

    // Step 2: Get Clerk user
    const clerkUser = await currentUser();
    console.log("Step 2 - clerkUser email:", clerkUser?.emailAddresses[0]?.emailAddress);

    if (!clerkUser) {
      console.error("❌ FAILED: Clerk user not found");
      return NextResponse.json(
        { success: false, error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    // Step 3: Connect to MongoDB
    await connectToDB();
    console.log("Step 3 - ✅ MongoDB connected");

    // Step 4: Check if user exists
    let user = await User.findOne({ clerkId: clerkUser.id });
    console.log("Step 4 - Existing user found:", !!user);

    if (user) {
      // Update existing user
      console.log("Step 5 - Updating existing user...");
      user.email = clerkUser.emailAddresses[0]?.emailAddress || "";
      user.firstName = clerkUser.firstName || undefined;
      user.lastName = clerkUser.lastName || undefined;
      user.profileImageUrl = clerkUser.imageUrl || undefined;
      user.username = clerkUser.username || undefined;
      user.lastSyncedAt = new Date();

      await user.save();
      console.log("✅ User UPDATED in MongoDB:", user._id);

      return NextResponse.json(
        {
          success: true,
          message: "User updated successfully",
          user: {
            _id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
          },
        },
        { status: 200 }
      );
    }

    // Step 5: Create new user
    console.log("Step 5 - Creating NEW user...");
    const newUser = new User({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      profileImageUrl: clerkUser.imageUrl,
      username: clerkUser.username,
      lastSyncedAt: new Date(),
    });

    await newUser.save();
    console.log("✅ NEW User CREATED in MongoDB:", newUser._id);
    console.log("========== ✅ POST /api/users/sync SUCCESS ==========\n");

    return NextResponse.json(
      {
        success: true,
        message: "User synced successfully",
        user: {
          _id: newUser._id,
          clerkId: newUser.clerkId,
          email: newUser.email,
          firstName: newUser.firstName,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ ERROR in /api/users/sync:", err);
    console.log("========== ❌ POST /api/users/sync FAILED ==========\n");

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync user",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/sync
 * Retrieves current user from MongoDB
 */
export async function GET() {
  try {
    console.log("========== 📍 GET /api/users/sync START ==========");

    const { userId } = await auth();
    console.log("userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId }).lean();
    console.log("User found:", !!user);

    if (!user) {
      console.log("⚠️ User not found in MongoDB");
      return NextResponse.json(
        { success: false, error: "User not found in MongoDB" },
        { status: 404 }
      );
    }

    console.log("✅ User retrieved from MongoDB");
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}