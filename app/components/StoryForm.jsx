'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For longer content
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function StoryForm({ initialData, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setShortDescription(initialData.shortDescription || '');
      setContent(initialData.content || '');
    } else {
      // Reset form for new entry
      setTitle('');
      setShortDescription('');
      setContent('');
    }
    setError(null); // Clear errors when initialData changes or form is reset
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim()) {
        setError('Title is required.');
        setLoading(false);
        return;
    }
    // Add more validation as needed (e.g., for length)

    const storyData = {
      title,
      shortDescription,
      content,
    };

    if (initialData?.id) {
      storyData.id = initialData.id; // Include ID if updating
    }

    await onSave(storyData); // onSave should handle API call and further error handling
    setLoading(false);
    // Form usually gets hidden by parent component after successful save
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Interview Story' : 'Add New Interview Story'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Story Title (e.g., Challenging Project Leadership)"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="shortDescription">Short Description (max 200 chars)</Label>
            <Textarea 
              id="shortDescription" 
              value={shortDescription} 
              onChange={(e) => setShortDescription(e.target.value)} 
              placeholder="A brief summary of the story (1-2 sentences)"
              maxLength={200} // Enforce max length visually
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="content">Full Story (5-10 sentences)</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Describe the situation, your actions, and the result..."
              rows={8} // Adjust rows as needed for typical length
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Story')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 