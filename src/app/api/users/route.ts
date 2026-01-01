/**
 * API Route: /api/users
 * Handles user-related operations (server-side only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

// POST /api/users - Create user in database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // FIX: Added RollNo and roll_no to destructuring
    const { UserID, Name, Email, Role, Year, Dept, Designation, MobileNumber, RollNo, roll_no } = body;

    if (!UserID || !Name || !Email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = getSupabaseService();

    try {
      // Check if user already exists
      const existingUser = await service.getUserById(UserID);
      if (existingUser) {
        return NextResponse.json({
          success: true,
          data: existingUser,
          message: 'User already exists',
        });
      }

      const newUser = await service.createUser({
        user_id: UserID,
        name: Name,
        email: Email,
        role: (Role || 'student') as 'student' | 'admin',
        year: Year || '',
        dept: Dept || '',
        designation: Designation || '',
        mobile_number: MobileNumber || '',
        // FIX: Map either PascalCase or snake_case input to the database field
        roll_no: RollNo || roll_no || '', 
      });

      console.log('User created successfully in Supabase:', newUser.user_id);
      return NextResponse.json({
        success: true,
        data: newUser,
      });
    } catch (serviceError: any) {
      console.error('Supabase service error:', serviceError);
      // If it's a duplicate key error, user might have been created between check and insert
      if (serviceError.message?.includes('duplicate') || serviceError.code === '23505') {
        // Try to fetch the user again
        try {
          const user = await service.getUserById(UserID);
          if (user) {
            return NextResponse.json({
              success: true,
              data: user,
              message: 'User already exists (created concurrently)',
            });
          }
        } catch (fetchError) {
          // Fall through to original error
        }
      }
      throw serviceError;
    }
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create user',
      },
      { status: 500 }
    );
  }
}

// GET /api/users?userId=xxx - Get user by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const service = getSupabaseService();
    const user = await service.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform to match expected format (for backward compatibility)
    const transformedUser = {
      UserID: user.user_id,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Year: user.year,
      Dept: user.dept,
      Designation: user.designation,
      MobileNumber: user.mobile_number,
      RollNo: user.roll_no,
      CreatedAt: user.created_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}


// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { UserID, Name, Year, Dept, RollNo, MobileNumber } = body;

    if (!UserID) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const service = getSupabaseService();

    // Map frontend CamelCase to backend snake_case
    const updates: any = {};
    if (Name) updates.name = Name;
    if (Year) updates.year = Year;
    if (Dept) updates.dept = Dept;
    if (RollNo) updates.roll_no = RollNo;
    if (MobileNumber) updates.mobile_number = MobileNumber;

    const updatedUser = await service.updateUser(UserID, updates);

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update user',
      },
      { status: 500 }
    );
  }
}