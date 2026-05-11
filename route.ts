import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDB } from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred -- invalid signature', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`[Clerk Webhook] Received event: ${eventType} for user ${id}`);

  await connectToDB();

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = evt.data;
    const email = email_addresses[0]?.email_address || '';

    // This logic is similar to your existing /api/users/sync POST,
    // but it's triggered by Clerk's webhook instead of a client-side request.
    // You would adapt your existing User.findOne and save/update logic here.
    // For brevity, I'm omitting the full implementation, but it would go here.
    // (The previous diff already removed the sensitive console.logs from the original route.ts)

    // Example of how you would handle user creation/update:
    try {
      let user = await User.findOne({ clerkId });

      if (user) {
        // Update existing user
        user.email = email;
        user.firstName = first_name || undefined;
        user.lastName = last_name || undefined;
        user.profileImageUrl = image_url || undefined;
        user.username = username || undefined;
        user.lastSyncedAt = new Date();
        await user.save();
        console.log(`[User Sync via Webhook] Success: Updated ${user._id}`);
      } else {
        // Create new user
        const newUser = new User({
          clerkId,
          email,
          firstName: first_name,
          lastName: last_name,
          profileImageUrl: image_url,
          username,
          lastSyncedAt: new Date(),
        });
        await newUser.save();
        console.log(`[User Sync via Webhook] Success: Created ${newUser._id}`);
      }
      return NextResponse.json({ success: true, message: 'User synced successfully' }, { status: 200 });
    } catch (dbError) {
      console.error('❌ ERROR syncing user in webhook:', dbError);
      return NextResponse.json({ success: false, error: 'Failed to sync user via webhook', details: dbError instanceof Error ? dbError.message : 'Unknown error' }, { status: 500 });
    }
  }

  return new Response('Webhook event not handled', { status: 200 });
}
