import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/format';
import { byCategory } from '@/lib/aggregate';
import type { Expense } from '@/lib/database.types';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category');
  const paymentMode = searchParams.get('paymentMode');

  const [{ data: profile }, { data: categories }] = await Promise.all([
    supabase.from('profiles').select('currency, date_format').eq('id', user.id).single(),
    supabase.from('categories').select('*').eq('user_id', user.id),
  ]);
  const currency = profile?.currency || 'INR';
  const dateFormat = profile?.date_format || 'DD/MM/YYYY';

  let query = supabase
    .from('expenses')
    .select('*, documents:linked_document_id(file_name)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('date', { ascending: false });
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);
  if (category) query = query.eq('category', category);
  if (paymentMode) query = query.eq('payment_mode', paymentMode);

  const { data: rows, error } = await query.limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const expenses = (rows || []) as (Expense & { documents: { file_name: string } | null })[];
  const rangeLabel = from && to ? `${from}_to_${to}` : 'all-time';

  if (format === 'csv') {
    const header = ['Date', 'Vendor', 'Amount', 'Category', 'Payment Mode', 'Notes', 'Linked Document'];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [header.join(',')];
    for (const e of expenses) {
      lines.push(
        [
          e.date,
          escape(e.vendor || ''),
          Number(e.amount).toFixed(2),
          escape(e.category),
          escape(e.payment_mode),
          escape(e.notes || ''),
          escape(e.documents?.file_name || ''),
        ].join(',')
      );
    }
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="expenses_${rangeLabel}.csv"`,
      },
    });
  }

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expenses');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Vendor', key: 'vendor', width: 24 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Payment Mode', key: 'paymentMode', width: 18 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Linked Document', key: 'doc', width: 24 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDE9FE' } };
    for (const e of expenses) {
      const row = sheet.addRow({
        date: e.date,
        vendor: e.vendor || '',
        amount: Number(e.amount),
        category: e.category,
        paymentMode: e.payment_mode,
        notes: e.notes || '',
        doc: e.documents?.file_name || '',
      });
      row.getCell('amount').numFmt = `${currency} #,##0.00`;
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="expenses_${rangeLabel}.xlsx"`,
      },
    });
  }

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const catBreakdown = byCategory(expenses, categories || []);

    doc.fontSize(20).fillColor('#1a1a2e').text('Spendly — Expense Report', { align: 'left' });
    doc.fontSize(10).fillColor('#6b6b80').text(`Generated ${new Date().toLocaleString()} • ${expenses.length} transactions`);
    doc.moveDown(1);

    doc.fontSize(13).fillColor('#1a1a2e').text('Summary');
    doc.fontSize(11).fillColor('#333').text(`Total spent: ${formatCurrency(total, currency)}`);
    doc.text(`Date range: ${from || 'earliest'} to ${to || 'latest'}`);
    doc.moveDown(1);

    doc.fontSize(13).fillColor('#1a1a2e').text('Spend by Category');
    doc.moveDown(0.3);
    const chartX = 40;
    let chartY = doc.y;
    const maxVal = Math.max(1, ...catBreakdown.map((c) => c.value));
    const barMaxWidth = 300;
    for (const c of catBreakdown) {
      const barWidth = (c.value / maxVal) * barMaxWidth;
      doc.fontSize(9).fillColor('#1a1a2e').text(c.name, chartX, chartY, { width: 100 });
      doc.rect(chartX + 105, chartY - 1, Math.max(2, barWidth), 12).fill(c.color);
      doc.fillColor('#1a1a2e').fontSize(9).text(formatCurrency(c.value, currency), chartX + 110 + barMaxWidth, chartY - 1, { width: 90 });
      chartY += 18;
    }
    doc.y = chartY + 10;

    doc.fontSize(13).fillColor('#1a1a2e').text('Itemized Expenses');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colX = { date: 40, vendor: 105, category: 230, mode: 335, amount: 460 };
    doc.fontSize(9).fillColor('#6b6b80');
    doc.text('Date', colX.date, tableTop);
    doc.text('Vendor', colX.vendor, tableTop);
    doc.text('Category', colX.category, tableTop);
    doc.text('Payment', colX.mode, tableTop);
    doc.text('Amount', colX.amount, tableTop);
    doc.moveTo(40, tableTop + 14).lineTo(555, tableTop + 14).strokeColor('#ece9f7').stroke();

    let y = tableTop + 20;
    doc.fontSize(9).fillColor('#1a1a2e');
    for (const e of expenses) {
      if (y > 780) {
        doc.addPage();
        y = 40;
      }
      doc.text(formatDate(e.date, dateFormat), colX.date, y, { width: 60 });
      doc.text((e.vendor || '—').slice(0, 20), colX.vendor, y, { width: 120 });
      doc.text(e.category, colX.category, y, { width: 100 });
      doc.text(e.payment_mode, colX.mode, y, { width: 120 });
      doc.text(formatCurrency(Number(e.amount), currency), colX.amount, y, { width: 90 });
      y += 16;
    }

    doc.end();
    const buffer = await done;
    return new NextResponse(buffer as unknown as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="expenses_${rangeLabel}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
}
