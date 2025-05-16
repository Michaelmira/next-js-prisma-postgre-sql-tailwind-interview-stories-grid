'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSelectedStory } from '@/app/context/SelectedStoryContext';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedTitle } = useSelectedStory();

  return (
    <nav className="w-60 bg-gray-800 text-white p-4 min-h-screen flex flex-col">
      <h1 className="text-xl font-bold mb-2 text-left">Interview Stories</h1>
      {selectedTitle && (
        <div className="mb-4 p-2 bg-gray-700 rounded">
          <p className="text-sm font-semibold text-yellow-300">Selected Story:</p>
          <p className="text-md truncate" title={selectedTitle}>{selectedTitle}</p>
        </div>
      )}
      <ul className="space-y-2 flex-grow">
        <li>
          <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-700">
            My Stories
          </Link>
        </li>
        {status === 'authenticated' && (
          <li>
            {/* <Link href="/create-story" className="block px-3 py-2 rounded hover:bg-gray-700">
              Add New Story
            </Link> */}
            <span className="block px-3 py-2 text-gray-400">Add New Story (Soon)</span>
          </li>
        )}
      </ul>
      <div className="mt-auto space-y-2">
        {status === 'loading' && (
          <p className="text-sm text-gray-400">Loading user...</p>
        )}
        {status === 'unauthenticated' && (
          <>
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/signup')} className="w-full" variant="secondary">
              Sign Up
            </Button>
          </>
        )}
        {status === 'authenticated' && session?.user && (
          <div className="text-sm">
            <p className="mb-2">{session.user.name || session.user.email}</p>
            <Button onClick={() => signOut({ callbackUrl: '/auth/signin' })} variant="outline" className="w-full bg-transparent hover:bg-gray-700 text-white">
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
} 