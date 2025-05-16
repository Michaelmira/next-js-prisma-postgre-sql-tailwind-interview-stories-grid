// app/post-details/[id]/page.jsx
import prisma from '../../../lib/prisma'; // Adjust the path as needed

export default async function PostDetailsPage(props) {
  // Destructure `params` from props, then extract `id`
  const { id } = props.params;

  // Use the string `id` directly when querying Prisma
  const post = await prisma.post.findUnique({
    where: { id },
    include: { 
      author: true, // Include related author info
      // You can add more relations if needed (e.g., comments: true)
    },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="mb-4">{post.content}</p>
      <div className="text-sm text-gray-600">
        Written by: {post.author?.name}
      </div>
      {/* Render any additional post information as needed */}
    </div>
  );
}
