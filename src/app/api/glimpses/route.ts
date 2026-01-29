/**
 * API Route: /api/glimpses
 * Handles GET (fetch custom glimpses for an event) and POST (add glimpse) requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

// GET /api/glimpses?eventId=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { success: false, error: 'Event ID is required' },
                { status: 400 }
            );
        }

        const service = getSupabaseService();
        const glimpses = await service.getEventGlimpses(eventId);

        return NextResponse.json({
            success: true,
            data: glimpses,
        });
    } catch (error: any) {
        console.error('Error fetching glimpses:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch glimpses',
            },
            { status: 500 }
        );
    }
}

// POST /api/glimpses - Add new glimpse (admin only)
export async function POST(request: NextRequest) {
    try {
        // TODO: Add Auth check if not handled by middleware or client
        const body = await request.json();
        const { event_id, image_url, caption } = body;

        if (!event_id || !image_url) {
            return NextResponse.json(
                { success: false, error: 'Event ID and Image URL are required' },
                { status: 400 }
            );
        }

        const service = getSupabaseService();
        const newGlimpse = await service.createGlimpse({
            event_id,
            image_url,
            caption: caption || '',
        });

        return NextResponse.json({
            success: true,
            data: newGlimpse,
        });
    } catch (error: any) {
        console.error('Error creating glimpse:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create glimpse',
            },
            { status: 500 }
        );
    }
}

// DELETE can be handled here too if we pass ID via query param or body, or use a dynamic route
