/**
 * API Route: /api/export
 * Handles data export to Excel and PDF formats (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

// GET /api/export?type=registrations&format=excel
// GET /api/export?type=events&format=pdf
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'events', 'registrations', 'users', 'winners'
    const format = searchParams.get('format') || 'excel'; // 'excel' or 'pdf'

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type parameter is required (events, registrations, users, winners)' },
        { status: 400 }
      );
    }

    const service = getSupabaseService();
    let data: any[] = [];
    let filename = '';

    // Get filter parameters
    const year = searchParams.get('year');
    const dept = searchParams.get('dept');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Fetch data based on type
    switch (type) {
      case 'events':
        data = await service.getAllEvents();
        filename = 'events';
        break;
      case 'registrations':
        // Get filtered registrations if filters are provided
        if (year || dept || eventId || status || search) {
          data = await service.getFilteredRegistrations({
            year: year || undefined,
            dept: dept || undefined,
            eventId: eventId || undefined,
            status: (status as 'confirmed' | 'cancelled') || undefined,
            search: search || undefined,
          });
        } else {
          // Get all registrations and add event information
          const registrations = await service.getAllRegistrations();
          if (registrations.length > 0) {
            const { supabaseAdmin } = await import('@/lib/supabase/client');
            const eventIds = registrations.map(reg => reg.event_id);
            const { data: events } = await supabaseAdmin
              .from('events')
              .select('id, title, start_time')
              .in('id', eventIds);

            data = registrations.map(reg => {
              const event = events?.find((e: any) => e.id === reg.event_id);
              return {
                ...reg,
                event_title: event?.title || 'Unknown Event',
                event_start_time: event?.start_time || '',
              };
            });
          } else {
            data = [];
          }
        }
        filename = 'registrations';
        break;
      case 'users':
        // Get filtered users if filters are provided
        if (year || dept || searchParams.get('role') || search) {
          const allUsers = await service.getAllUsers();
          // Apply filters client-side
          let filtered = allUsers;
          if (year) filtered = filtered.filter(u => u.year === year);
          if (dept) filtered = filtered.filter(u => u.dept === dept);
          const role = searchParams.get('role');
          if (role) filtered = filtered.filter(u => u.role === role);
          if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(u =>
              u.name?.toLowerCase().includes(searchLower) ||
              u.email?.toLowerCase().includes(searchLower) ||
              u.year?.toLowerCase().includes(searchLower) ||
              u.dept?.toLowerCase().includes(searchLower)
            );
          }
          data = filtered;
        } else {
          data = await service.getAllUsers();
        }
        filename = 'users';
        break;
      case 'winners':
        data = await service.getAllWinners();
        filename = 'winners';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: events, registrations, users, or winners' },
          { status: 400 }
        );
    }

    if (format === 'excel') {
      // Export to Excel using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(type);

      // Add headers
      if (data.length > 0) {
        // For registrations and users, use friendly column names
        let headers: string[] = [];
        if (type === 'registrations') {
          headers = ['Event Name', 'User Email', 'Year', 'Department', 'Roll No.', 'Mobile Number', 'Registered On', 'Status'];
        } else if (type === 'users') {
          headers = ['Name', 'Email', 'Mobile Number', 'Role', 'Year', 'Department', 'Joined Date'];
        } else {
          headers = Object.keys(data[0]).map(key =>
            key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          );
        }
        worksheet.addRow(headers);

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' }, // Blue
        };
        headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } }; // White text
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add data rows
        if (type === 'registrations') {
          data.forEach((row: any) => {
            worksheet.addRow([
              row.event_title || row.event_id || 'Unknown Event',
              row.user_email || '',
              row.year || '',
              row.dept || '',
              row.roll_no || '',
              row.mobile_number || '',
              row.timestamp ? new Date(row.timestamp).toLocaleString() : '',
              row.status || '',
            ]);
          });
        } else if (type === 'users') {
          data.forEach((row: any) => {
            worksheet.addRow([
              row.name || '',
              row.email || '',
              row.mobile_number || '',
              row.role || '',
              row.year || 'N/A',
              row.dept || 'N/A',
              row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
            ]);
          });
        } else {
          data.forEach((row: any) => {
            worksheet.addRow(Object.values(row));
          });
        }

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
          if (column) {
            let maxLength = 0;
            (column as any).eachCell({ includeEmpty: true }, (cell: any) => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
          }
        });
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      // Export to PDF
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      // Prepare table data
      if (data.length > 0) {
        let headers: string[] = [];
        let rows: any[] = [];

        if (type === 'registrations') {
          headers = ['Event Name', 'User Email', 'Year', 'Department', 'Roll No.', 'Mobile Number', 'Registered On', 'Status'];
          rows = data.map((row: any) => [
            row.event_title || row.event_id || 'Unknown Event',
            row.user_email || '',
            row.year || '',
            row.dept || '',
            row.roll_no || '',
            row.mobile_number || '',
            row.timestamp ? new Date(row.timestamp).toLocaleString() : '',
            row.status || '',
          ]);
        } else if (type === 'users') {
          headers = ['Name', 'Email', 'Mobile Number', 'Designation', 'Role', 'Year', 'Department', 'Joined Date'];
          rows = data.map((row: any) => [
            row.name || '',
            row.email || '',
            row.mobile_number || '',
            row.designation || 'N/A',
            row.role || '',
            row.year || 'N/A',
            row.dept || 'N/A',
            row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
          ]);
        } else {
          headers = Object.keys(data[0]).map(key =>
            key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          );
          rows = data.map(item => Object.values(item).map(val => String(val)));
        }

        // Simple table implementation
        let yPos = 30;
        const cellHeight = 8;
        const maxCols = Math.min(headers.length, 5); // Limit columns for readability
        const pageWidth = 190;
        const cellWidth = pageWidth / maxCols;
        const startX = 10;

        // Draw headers with background
        doc.setFillColor(37, 99, 235);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        for (let i = 0; i < maxCols; i++) {
          doc.rect(startX + i * cellWidth, yPos, cellWidth, cellHeight, 'FD');
          const headerText = headers[i]?.substring(0, 12) || '';
          doc.text(headerText, startX + i * cellWidth + 2, yPos + 5);
        }

        // Draw rows
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        rows.slice(0, 25).forEach((row) => { // Limit to 25 rows per page
          yPos += cellHeight;
          if (yPos > 270) { // New page if needed
            doc.addPage();
            yPos = 20;
          }
          for (let i = 0; i < maxCols; i++) {
            doc.rect(startX + i * cellWidth, yPos, cellWidth, cellHeight, 'S');
            const cellText = String(row[i] || '').substring(0, 15);
            doc.text(cellText, startX + i * cellWidth + 2, yPos + 5);
          }
        });

        if (rows.length > 25) {
          doc.text(`... and ${rows.length - 25} more rows`, startX, yPos + 15);
        }
      } else {
        doc.text('No data available', 14, 30);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Use: excel or pdf' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to export data',
      },
      { status: 500 }
    );
  }
}

