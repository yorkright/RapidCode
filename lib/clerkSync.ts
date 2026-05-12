import  { currentUser } from "@clerk/nextjs/server";
import User, { IUser } from "../models/User";
import connectToDB from "./mongoose";

export interface ClerkUserData {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  username?: string | null;
}

/**
 * 🔄 Sync Clerk user data to MongoDB
 */
export async function syncClerkUserToMongo(
  clerkUserData: ClerkUserData
): Promise<IUser> {
  await connectToDB();

  const existingUser = await User.findOne({ clerkId: clerkUserData.clerkId });

  if (existingUser) {
    existingUser.email = clerkUserData.email;
    existingUser.firstName = clerkUserData.firstName || undefined;
    existingUser.lastName = clerkUserData.lastName || undefined;
    existingUser.profileImageUrl = clerkUserData.profileImageUrl || undefined;
    existingUser.username = clerkUserData.username || undefined;
    existingUser.lastSyncedAt = new Date();

    return await existingUser.save();
  }

  const newUser = new User({
    clerkId: clerkUserData.clerkId,
    email: clerkUserData.email,
    firstName: clerkUserData.firstName,
    lastName: clerkUserData.lastName,
    profileImageUrl: clerkUserData.profileImageUrl,
    username: clerkUserData.username,
    lastSyncedAt: new Date(),
  });

  return await newUser.save();
}

/**
 * 🔍 Get user from MongoDB by Clerk ID
 */
export async function getMongoUserByClerkId(clerkId: string): Promise<IUser | null> {
  await connectToDB();
  return await User.findOne({ clerkId });
}

/**
 * 🔄 Auto-sync from Clerk server
 */
export async function autoSyncCurrentUser(): Promise<IUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const userData: ClerkUserData = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.imageUrl,
    username: clerkUser.username,
  };

  return await syncClerkUserToMongo(userData);
}