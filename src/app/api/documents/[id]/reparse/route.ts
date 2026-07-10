import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractExpenseFromDocument } from '@/lib/gemini';
import type { Json } from '@/lib/database.types';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: doc } = await supabase.from('documents').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  await supabase.from('documents').update({ parsed_status: 'processing' }).eq('id', id);

  const { data: fileData, error: downloadError } = await supabase.storage.from('documents').download(doc.storage_path);
  if (downloadError || !fileData) {
    await supabase.from('documents').update({ parsed_status: 'failed' }).eq('id', id);
    return NextResponse.json({ error: `Could not read file: ${downloadError?.message}` }, { status: 500 });
  }

  try {
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const extracted = await extractExpenseFromDocument(buffer, doc.mime_type);
    await supabase.from('documents').update({ parsed_status: 'parsed', extracted_data: extracted as unknown as Json }).eq('id', id);
    return NextResponse.json({ document: { ...doc, parsed_status: 'parsed', extracted_data: extracted } });
  } catch (aiError) {
    await supabase.from('documents').update({ parsed_status: 'failed' }).eq('id', id);
    return NextResponse.json(
      { error: `AI extraction failed: ${aiError instanceof Error ? aiError.message : 'unknown error'}` },
      { status: 502 }
    );
  }
}
