import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const path = formData.get('path') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!path) {
            return NextResponse.json(
                { success: false, error: 'No path provided' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Supabase Storage using Admin Client (Bypasses RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('glimpses')
            .upload(path, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get Public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('glimpses')
            .getPublicUrl(path);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
