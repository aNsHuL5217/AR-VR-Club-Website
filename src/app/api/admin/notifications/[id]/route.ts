import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Notification ID is required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Notification deleted successfully' });

    } catch (error: any) {
        console.error('Delete Notification Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
