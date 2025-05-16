import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  const { storyContent, optimizationType } = await request.json();

  if (!storyContent || !optimizationType) {
    return Response.json({ success: false, message: 'Missing story content or optimization type' }, { status: 400 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  let systemPrompt = "";
  let userMessageContent = "";

  if (optimizationType === 'star') {
    // System prompt can be used for general instructions to the model across turns, if needed.
    // For this single-turn request, including it in the user message is also fine.
    systemPrompt = "You are an assistant that optimizes interview stories.";
    userMessageContent = `Optimize the following interview story using the STAR method. Ensure the optimized story is about 5-10 sentences long. Please write the optimized story in the first person and present it as a single paragraph. Here's the story:\n\n${storyContent}`;
  } else if (optimizationType === 'keywords') {
    systemPrompt = "You are an assistant that highlights key words in interview stories.";
    userMessageContent = `For the following interview story, identify key impactful words or short phrases that help tell the story powerfully. Make these words/phrases bold using markdown (e.g., **word**). Return ONLY the full story with these words highlighted, with no introductory text. Ensure the final output is in the first person and presented as a single paragraph. Here's the story:\n\n${storyContent}`;
  } else {
    return Response.json({ success: false, message: 'Invalid optimization type' }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000, // Renamed from max_tokens_to_sample
      // system: systemPrompt, // Optional: System prompt can be added here
      messages: [
        { 
          role: 'user', 
          content: userMessageContent 
        }
      ]
    });

    // The response structure for Messages API is different
    // content is an array of blocks, typically one text block for Haiku
    const optimizedContent = message.content && message.content[0] && message.content[0].type === 'text' 
                             ? message.content[0].text 
                             : "";

    return Response.json({ success: true, optimizedContent: optimizedContent });
  } catch (error) {
    console.error('Anthropic API error:', error);
    let errorMessage = 'Error optimizing story with AI';
    if (error.message) {
        errorMessage += `: ${error.message}`;
    }
    return Response.json({ success: false, message: errorMessage, error: error.message }, { status: 500 });
  }
} 