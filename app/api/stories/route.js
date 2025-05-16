import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjusted path
import prisma from '@/lib/prisma';

export async function GET(request) {
  console.log("API GET /api/stories: Checking NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "NOT SET OR EMPTY"); // Added log for GET
  const session = await getServerSession(authOptions);
  console.log("API GET /api/stories: Session object:", JSON.stringify(session, null, 2)); // Added log for GET

  if (!session || !session.user?.id) { // Ensure session.user.id exists
    console.error("API GET /api/stories: Unauthorized or session.user.id missing."); // Added log for GET
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Security check: Ensure the logged-in user is requesting their own stories
  if (session.user.id !== userId) {
    console.warn(`Forbidden access attempt: session user ${session.user.id} tried to access stories for ${userId}`);
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const stories = await prisma.interviewStory.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        updatedAt: 'desc', // Or createdAt, or title, etc.
      },
    });
    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request) {
  console.log("API POST /api/stories: Checking NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "NOT SET OR EMPTY"); // Added log
  const session = await getServerSession(authOptions);
  console.log("API POST /api/stories: Session object:", JSON.stringify(session, null, 2)); // Added log

  if (!session || !session.user?.id) {
    console.error("API POST /api/stories: Unauthorized access attempt or session.user.id missing."); // Added log
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, shortDescription, content } = await request.json();

    if (!title || !shortDescription || !content) {
      return NextResponse.json({ message: 'Title, short description, and content are required.' }, { status: 400 });
    }

    const newStory = await prisma.interviewStory.create({
      data: {
        title,
        shortDescription,
        content,
        authorId: session.user.id, // Associate story with the logged-in user
        published: true, // Or false by default, if you want a review step
      },
    });

    return NextResponse.json({ message: 'Story created successfully', story: newStory }, { status: 201 });

  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json({ message: 'Failed to create story' }, { status: 500 });
  }
}

// We can add POST, PUT, DELETE handlers here later for creating, updating, and deleting stories. 