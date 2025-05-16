import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email,
        name: name, // Will be null if not provided, which is fine for an optional field
        password: hashedPassword,
      },
    });

    // Don't return the password hash in the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ message: 'User created successfully', user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    // Check for specific Prisma errors if needed, e.g., P2002 for unique constraint violation (though we check email manually above)
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 