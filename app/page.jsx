'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import StoryForm from '@/app/components/StoryForm';
import { useSelectedStory } from '@/app/context/SelectedStoryContext';
import ReactMarkdown from 'react-markdown';

const FullStoryDisplay = ({ story, onEdit, onDelete, onApplyOptimizedContent }) => {
  if (!story) return null;
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState(null);
  const [optimizedDisplayContent, setOptimizedDisplayContent] = useState(null);

  const handleOptimize = async (optimizationType) => {
    setOptimizing(true);
    setOptimizationError(null);
    try {
      const response = await fetch('/api/optimize-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyContent: story.content, optimizationType }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to optimize story');
      }
      setOptimizedDisplayContent(result.optimizedContent);
    } catch (err) {
      console.error(`Error optimizing story (${optimizationType}):`, err);
      setOptimizationError(err.message || `Could not optimize the story with ${optimizationType}.`);
      setOptimizedDisplayContent(null);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="mb-6 w-full flex flex-col">
      <CardContent className="prose max-w-none flex-grow min-h-[150px]">
        {optimizedDisplayContent ? (
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>{optimizedDisplayContent}</ReactMarkdown>
          </div>
        ) : (
          story.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))
        )}
      </CardContent>
      {optimizationError && (
        <CardFooter className="text-red-500 text-sm pt-2 pb-2 border-t">
          <p>Error: {optimizationError}</p>
        </CardFooter>
      )}
      {optimizing && (
        <CardFooter className="text-blue-500 text-sm pt-2 pb-2 border-t">
          <p>Optimizing with AI, please wait...</p>
        </CardFooter>
      )}
      <CardFooter className="flex justify-end items-center pt-4 space-x-2 border-t mt-auto">
        {optimizedDisplayContent && (
           <Button size="sm" variant="default" onClick={() => {
             onApplyOptimizedContent({ ...story, content: optimizedDisplayContent });
             setOptimizedDisplayContent(null);
             setOptimizationError(null);
           }}>
            Use This Optimized Content
           </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => handleOptimize('star')} disabled={optimizing}>
          {optimizing && optimizedDisplayContent === null ? 'Optimizing...' : 'Optimize with STAR'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleOptimize('keywords')} disabled={optimizing}>
          {optimizing && optimizedDisplayContent === null ? 'Highlighting...' : 'Highlight Keywords'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
            setOptimizedDisplayContent(null);
            setOptimizationError(null);
            onEdit(story);
        }} 
        disabled={optimizing}>
          Edit Original
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const { setSelectedTitle } = useSelectedStory();

  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyFormInitialData, setStoryFormInitialData] = useState(null);
  const [pageError, setPageError] = useState(null);

  const fetchStories = () => {
    if (status === 'authenticated' && session?.user?.id) {
      setPageError(null);
      fetch(`/api/stories?userId=${session.user.id}`)
        .then((res) => {
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return res.json();
        })
        .then((data) => {
          if (data.success) {
            setStories(data.stories);
          } else {
            console.error("Failed to fetch stories:", data.error);
            setPageError(data.error || "Failed to load stories.");
            setStories([]);
          }
        })
        .catch(error => {
            console.error("Error fetching stories:", error);
            setPageError(error.message || "An unexpected error occurred while fetching stories.");
            setStories([]);
        });
    }
  };

  useEffect(() => {
    fetchStories();
  }, [status, session]);

  const handleStoryCardClick = (story) => {
    setSelectedStory(story);
    setSelectedTitle(story.title);
    setShowStoryForm(false);
    setPageError(null);
  };

  const handleAddNewStoryClick = () => {
    setSelectedStory(null);
    setSelectedTitle(null);
    setStoryFormInitialData(null);
    setShowStoryForm(true);
    setPageError(null);
  };
  
  const handleEditStoryClick = (storyToEdit) => {
    setSelectedStory(null); 
    setSelectedTitle(storyToEdit.title); 
    setStoryFormInitialData(storyToEdit);
    setShowStoryForm(true);
    setPageError(null);
  };

  const handleApplyOptimizedContentToForm = (optimizedStory) => {
    setStoryFormInitialData(optimizedStory);
    setShowStoryForm(true);
    setSelectedStory(null); 
    setSelectedTitle(optimizedStory.title); 
  };

  const handleCancelForm = () => {
    setShowStoryForm(false);
    setPageError(null);
    setSelectedTitle(null);
    const storyToRestore = storyFormInitialData && storyFormInitialData.id ? stories.find(s => s.id === storyFormInitialData.id) : null;
    if (storyToRestore && !showStoryForm) {
        setSelectedStory(storyToRestore);
        setSelectedTitle(storyToRestore.title);
    } else {
        setSelectedStory(null);
    }
  };

  const handleSaveStory = async (storyData) => {
    setPageError(null);
    const method = storyData.id ? 'PUT' : 'POST';
    const endpoint = storyData.id ? `/api/stories/${storyData.id}` : '/api/stories';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to ${storyData.id ? 'update' : 'create'} story`);
      }
      fetchStories();
      setShowStoryForm(false);
      setSelectedTitle(null);
      if (result.story) {
        setSelectedStory(result.story);
        setSelectedTitle(result.story.title);
      } else {
        const updatedStories = await fetch(`/api/stories?userId=${session.user.id}`).then(r => r.json());
        if(updatedStories.success && updatedStories.stories.length > 0) {
            const currentStory = updatedStories.stories.find(s => s.id === storyData.id) || updatedStories.stories[0];
            setSelectedStory(currentStory);
            setSelectedTitle(currentStory.title);
        } else {
            setSelectedStory(null);
        }
      }
    } catch (err) {
      console.error("Save story error:", err);
      setPageError(err.message || "Could not save the story.");
    }
  };
  
  const handleDeleteStory = async (storyId) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    setPageError(null);
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete story');
      }
      fetchStories();
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
        setSelectedTitle(null);
      }
    } catch (err) {
      console.error("Delete story error:", err);
      setPageError(err.message || "Could not delete the story.");
    }
  };

  if (status === 'loading') {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Welcome to Interview Stories</h1>
        <p className="mb-6">Please sign in to access your interview stories.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {pageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error: </strong> {pageError}
        </div>
      )}
      <div className="mb-6 min-h-[250px]">
        {showStoryForm ? (
          <StoryForm 
            initialData={storyFormInitialData} 
            onSave={handleSaveStory} 
            onCancel={handleCancelForm}
          />
        ) : selectedStory ? (
          <FullStoryDisplay 
            story={selectedStory} 
            onEdit={handleEditStoryClick} 
            onDelete={handleDeleteStory}
            onApplyOptimizedContent={handleApplyOptimizedContentToForm}
          />
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg min-h-[250px] flex flex-col justify-center items-center">
            <p className="text-gray-500 text-lg">Select a story from the grid to view its details.</p>
            <p className="text-gray-400 mt-2">Or, click "Add New Story" to create your first one!</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Interview Stories Grid</h1>
        {!showStoryForm && selectedStory === null && (
          <Button onClick={handleAddNewStoryClick}>Add New Story</Button>
        )}
         {(showStoryForm || selectedStory !== null) && (
          <Button onClick={() => {
            setShowStoryForm(false);
            setSelectedStory(null);
            setSelectedTitle(null);
            setStoryFormInitialData(null);
          }}>Back to Grid</Button>
        )}
      </div>
      
      {!showStoryForm && (
        <>
          {stories.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">You haven't created any interview stories yet. 
                Click "Add New Story" above to create one.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stories.slice(0, 9).map((story) => ( 
              <Card key={story.id} className="cursor-pointer hover:shadow-lg transition-shadow relative group flex flex-col justify-between min-h-[150px]"
                    onClick={() => handleStoryCardClick(story)}>
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-3">{story.shortDescription}</CardDescription>
                </CardHeader>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex space-x-1 p-1 bg-white/80 rounded">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleEditStoryClick(story); }} aria-label="Edit Story">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-red-100 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }} aria-label="Delete Story">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
