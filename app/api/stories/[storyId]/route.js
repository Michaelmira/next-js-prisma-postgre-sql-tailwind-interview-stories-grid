import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Helper function to check if the story belongs to the current user
async function checkStoryOwnership(storyId, userId) {
  const story = await prisma.interviewStory.findUnique({
    where: { id: storyId },
  });
  if (!story) return 'notfound';
  if (story.authorId !== userId) return 'forbidden';
  return 'owned';
}

// GET a specific story (optional, if needed elsewhere)
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const { storyId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ownership = await checkStoryOwnership(storyId, session.user.id);
  if (ownership === 'notfound') {
    return NextResponse.json({ message: 'Story not found' }, { status: 404 });
  }
  // No need to check for forbidden here if only owner can GET, or make it public but that needs different logic
  // For now, assuming only owner can get their specific story via this route if used.

  try {
    const story = await prisma.interviewStory.findUnique({
        where: { id: storyId, authorId: session.user.id }, // Ensure fetching only if owned
    });
    if (!story) {
        return NextResponse.json({ message: 'Story not found or not owned by user' }, { status: 404 });
    }
    return NextResponse.json({ story }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching story ${storyId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch story' }, { status: 500 });
  }
}

// PUT (update) a specific story
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const { storyId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ownership = await checkStoryOwnership(storyId, session.user.id);
  if (ownership === 'notfound') {
    return NextResponse.json({ message: 'Story not found' }, { status: 404 });
  }
  if (ownership === 'forbidden') {
    return NextResponse.json({ message: 'Forbidden: You do not own this story' }, { status: 403 });
  }

  try {
    const { title, shortDescription, content, published } = await request.json();

    if (!title || !shortDescription || !content) {
      return NextResponse.json({ message: 'Title, short description, and content are required.' }, { status: 400 });
    }

    const updatedStory = await prisma.interviewStory.update({
      where: { id: storyId }, 
      data: {
        title,
        shortDescription,
        content,
        published: typeof published === 'boolean' ? published : undefined, // Optional: allow updating published status
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    return NextResponse.json({ message: 'Story updated successfully', story: updatedStory }, { status: 200 });

  } catch (error) {
    console.error(`Error updating story ${storyId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record to update not found
        return NextResponse.json({ message: 'Story not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update story' }, { status: 500 });
  }
}

// DELETE a specific story
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const { storyId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ownership = await checkStoryOwnership(storyId, session.user.id);
  if (ownership === 'notfound') {
    return NextResponse.json({ message: 'Story not found' }, { status: 404 });
  }
  if (ownership === 'forbidden') {
    return NextResponse.json({ message: 'Forbidden: You do not own this story' }, { status: 403 });
  }

  try {
    await prisma.interviewStory.delete({
      where: { id: storyId }, 
    });

    return NextResponse.json({ message: 'Story deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error) {
    console.error(`Error deleting story ${storyId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record to delete not found
        return NextResponse.json({ message: 'Story not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete story' }, { status: 500 });
  }
} 