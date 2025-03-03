// app/post-details/[id]/page.jsx
import prisma from '../../../lib/prisma'; // Adjust the path as needed
import { getSession } from "next-auth/react";

export default async function UserDashboard({ session }) {
  return (
    <div className="container mx-auto p-4">
      <h1>Protected User Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* You can add more user-specific information here */}
    </div>
  );
}

// This function will run on the server before rendering the page
export async function getServerSideProps(context) {
  // Check for user session
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  // Optionally, you can fetch user-specific data from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }, // Assuming session.user.id contains the user's ID
  });

  return {
    props: { session, user }, // Pass the session and user data to the component
  };
}