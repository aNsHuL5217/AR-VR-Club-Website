/**
 * API Route: /api/glimpses/[id]
 * Handles DELETE requests for a specific glimpse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Glimpse ID is required' },
                { status: 400 }
            );
        }

        const service = getSupabaseService();
        await service.deleteGlimpse(id);

        return NextResponse.json({
            success: true,
            message: 'Glimpse deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting glimpse:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to delete glimpse',
            },
            { status: 500 }
        );
    }
}
