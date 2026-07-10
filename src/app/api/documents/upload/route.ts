import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractExpenseFromDocument } from '@/lib/gemini';
import type { Json } from '@/lib/database.types';

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Only PDF, JPG, and PNG files are supported' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File must be 10MB or smaller' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${user.id}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('documents').upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: docRow, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      parsed_status: 'processing',
    })
    .select('*')
    .single();

  if (insertError || !docRow) {
    return NextResponse.json({ error: `Could not save document record: ${insertError?.message}` }, { status: 500 });
  }

  try {
    const extracted = await extractExpenseFromDocument(buffer, file.type);
    await supabase
      .from('documents')
      .update({ parsed_status: 'parsed', extracted_data: extracted as unknown as Json })
      .eq('id', docRow.id);

    const { data: signedUrl } = await supabase.storage.from('documents').createSignedUrl(storagePath, 3600);

    return NextResponse.json(
      { document: { ...docRow, parsed_status: 'parsed', extracted_data: extracted }, url: signedUrl?.signedUrl },
      { status: 201 }
    );
  } catch (aiError) {
    await supabase.from('documents').update({ parsed_status: 'failed' }).eq('id', docRow.id);
    const { data: signedUrl } = await supabase.storage.from('documents').createSignedUrl(storagePath, 3600);
    return NextResponse.json(
      {
        document: { ...docRow, parsed_status: 'failed' },
        url: signedUrl?.signedUrl,
        warning: `AI extraction failed: ${aiError instanceof Error ? aiError.message : 'unknown error'}. You can enter details manually.`,
      },
      { status: 201 }
    );
  }
}
