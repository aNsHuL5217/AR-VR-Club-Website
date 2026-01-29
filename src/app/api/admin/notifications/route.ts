import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, message, type, link_url, link_text, is_active } = body;

        // Basic Validation
        if (!title) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                title,
                message,
                type,
                link_url,
                link_text,
                is_active: is_active ?? true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Create Notification Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create notification' },
            { status: 500 }
        );
    }
}
