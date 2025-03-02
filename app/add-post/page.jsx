// app/add-post/page.jsx

'use client'

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter()
 
    const handleSubmit = (e) => {
      e.preventDefault();

      try {
          fetch('/api/add-post', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({title, content}) })
          router.refresh()
      } catch (err) {
          console.error(err)
      }

      setTitle('');
      setContent('');
    };

    return (
        <main className="flex justify-center items-center min-h-screen bg-gray-50">
            <Link href={'/'} >Home</Link>
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-2xl font-bold text-center text-gray-800">Add New Post</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows="6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Submit Post
                    </button>
                </form>
            </div>
        </main>
    )
}