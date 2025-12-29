/**
 * API Route: /api/registrations
 * Handles GET (user registrations) and POST (create registration) requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

// GET /api/registrations?userId=xxx - Get user registrations
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
    const registrations = await service.getUserRegistrations(userId);

    // Transform to match expected format (for backward compatibility)
    const transformedRegistrations = registrations.map((reg: any) => {
      // Handle both old format (no events) and new format (with events)
      const event = reg.events || null;
      return {
        RegistrationID: reg.registration_id,
        EventID: reg.event_id,
        UserID: reg.user_id,
        UserEmail: reg.user_email,
        Year: reg.year,
        Dept: reg.dept,
        RollNo: reg.roll_no,
        MobileNumber: reg.mobile_number,
        Timestamp: reg.timestamp,
        Status: reg.status,
        // Include event information
        EventTitle: event?.title || 'Unknown Event',
        EventDescription: event?.description || '',
        EventStartTime: event?.start_time || '',
        EventEndTime: event?.end_time || '',
        EventStatus: event?.status || '',
      };
    });

    const response = NextResponse.json({
      success: true,
      data: transformedRegistrations,
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch registrations',
      },
      { status: 500 }
    );
  }
}

// POST /api/registrations - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, userEmail, year, dept, rollNo, mobileNumber } = body;

    if (!eventId || !userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = getSupabaseService();

    // 1. Fetch User Details from Database
    const userProfile = await service.getUserById(userId);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 2. Validate Profile Completeness
    // We expect year, dept, roll_no, and mobile_number to be present in the user profile
    if (!userProfile.year || !userProfile.dept || !userProfile.roll_no || !userProfile.mobile_number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please complete your profile (Year, Dept, Roll No, Mobile) before registering.',
          code: 'PROFILE_INCOMPLETE'
        },
        { status: 400 }
      );
    }

    // Check if already registered
    const isRegistered = await service.isUserRegistered(eventId, userId);
    if (isRegistered) {
      return NextResponse.json(
        { success: false, error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    console.log('Creating registration for user:', userProfile.email);

    try {
      // Use profile data for registration
      const registration = await service.createRegistration(
        eventId,
        userId,
        userProfile.email,
        userProfile.year,
        userProfile.dept,
        userProfile.roll_no,
        userProfile.mobile_number
      );
      console.log('Registration created successfully:', registration);

      // Transform to match expected format
      const transformedRegistration = {
        RegistrationID: registration.registration_id,
        EventID: registration.event_id,
        UserID: registration.user_id,
        UserEmail: registration.user_email,
        Year: registration.year,
        Dept: registration.dept,
        RollNo: registration.roll_no,
        MobileNumber: registration.mobile_number,
        Timestamp: registration.timestamp,
        Status: registration.status,
      };

      const response = NextResponse.json({
        success: true,
        data: transformedRegistration,
      });

      // Prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    } catch (regError: any) {
      console.error('Registration creation error:', regError);
      return NextResponse.json(
        {
          success: false,
          error: regError.message || 'Failed to create registration',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create registration',
      },
      { status: 500 }
    );
  }
}

