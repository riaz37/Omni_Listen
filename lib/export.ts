/**
 * Export utilities for CSV, PDF, and ICS formats
 */

import { downloadBlob } from './download-blob';

// CSV Export
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Build CSV content
  const csvContent = [
    csvHeaders.join(','), // Header row
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value).replace(/"/g, '""');
        return stringValue.includes(',') || stringValue.includes('\n')
          ? `"${stringValue}"`
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// ICS Calendar Export
export function exportToICS(events: any[], filename: string) {
  if (events.length === 0) {
    console.warn('No events to export');
    return;
  }

  const icsEvents = events.map(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end || event.start);

    return `BEGIN:VEVENT
UID:${event.id}@esaplisten.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${escapeICS(event.title || 'Untitled Event')}
DESCRIPTION:${escapeICS(event.description || '')}
${event.location ? `LOCATION:${escapeICS(event.location)}` : ''}
STATUS:CONFIRMED
END:VEVENT`;
  }).join('\n');

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OmniListen//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  downloadBlob(blob, `${filename}.ics`);
}

// PDF Export (using browser print)
export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn('Content not found for PDF export');
    return;
  }

  // Open print dialog (user can save as PDF)
  window.print();
}

// Helper: Format date for ICS
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper: Escape ICS text
function escapeICS(text: string): string {
  return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

// Export conversations to CSV
export function exportConversationsToCSV(conversations: any[]) {
  const data = conversations.map(m => ({
    'Date Created': new Date(m.created_at).toLocaleDateString(),
    'Conversation Name': m.title || m.job_id,
    'Events Count': m.event_count || 0,
    'Calendar Synced': m.calendar_synced ? 'Yes' : 'No',
    'Has Additional Analysis': m.has_custom_query ? 'Yes' : 'No',
  }));

  exportToCSV(data, `conversations_${new Date().toISOString().split('T')[0]}`);
}

// Export events to CSV
export function exportEventsToCSV(events: any[]) {
  const data = events.map(e => ({
    'Title': e.title,
    'Date': new Date(e.start).toLocaleDateString(),
    'Time': new Date(e.start).toLocaleTimeString(),
    'Type': e.type,
    'Description': e.description || '',
    'Synced': e.synced ? 'Yes' : 'No',
  }));

  exportToCSV(data, `events_${new Date().toISOString().split('T')[0]}`);
}

// Export notes to CSV
export function exportNotesToCSV(notes: any[]) {
  const data = notes.map(n => ({
    'Title': n.title,
    'Category': n.category,
    'Description': n.description,
    'Date': n.date ? new Date(n.date).toLocaleDateString() : '',
  }));

  exportToCSV(data, `notes_${new Date().toISOString().split('T')[0]}`);
}

// Export single conversation to PDF with all details (Direct Download)
export async function exportConversationToPDF(conversation: any) {
  // Build HTML content
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px;">
        <h1 style="color: #4F46E5; margin: 0; font-size: 32px;">Conversation Analysis Report</h1>
        <p style="color: #666; margin-top: 10px; font-size: 14px;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
        <p style="color: #666; margin-top: 5px; font-size: 12px;">
          Date: ${new Date(conversation.created_at).toLocaleDateString()}
        </p>
      </div>

      <!-- Key Takeaways / Summary -->
      ${conversation.key_takeaways || conversation.final_summary ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">
            Key Takeaways
          </h2>
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #4F46E5;">
            ${(() => {
        const summary = conversation.key_takeaways || conversation.final_summary;
        const englishText = summary?.english;
        const arabicText = summary?.arabic || summary?.original_language;

        let content = '';
        if (englishText) {
          content += `<div style="margin-bottom: ${arabicText && arabicText !== englishText ? '20px' : '0'};">
                  <h3 style="font-size: 14px; color: #6B7280; margin-bottom: 10px;">English</h3>
                  <div style="line-height: 1.8; color: #111827;">
                    ${englishText.split('\n').map((line: string) => `<p style="margin-bottom: 10px;">${line}</p>`).join('')}
                  </div>
                </div>`;
        }
        if (arabicText && arabicText !== englishText) {
          content += `<div dir="rtl">
                  <h3 style="font-size: 14px; color: #6B7280; margin-bottom: 10px;">Arabic</h3>
                  <div style="line-height: 1.8; color: #111827;">
                    ${arabicText.split('\n').map((line: string) => `<p style="margin-bottom: 10px;">${line}</p>`).join('')}
                  </div>
                </div>`;
        }
        return content;
      })()}
          </div>
        </div>
      ` : ''}

      <!-- Action Items / Events -->
      ${conversation.dated_events && conversation.dated_events.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">
            Action Items (${conversation.dated_events.length})
          </h2>
          <div style="display: grid; gap: 15px;">
            ${conversation.dated_events.map((event: any) => {
        const title = event.title || event.task;
        const date = event.formatted_date || event.date || event.due_date;
        const description = event.description || event.context;

        return `
                <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">${title}</h3>
                  <div style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">
                    📅 ${date || 'TBD'}
                  </div>
                  <div style="color: #6B7280; font-size: 13px; margin-bottom: ${description ? '8px' : '0'};">
                    👤 ${event.assignee || 'Unassigned'}
                  </div>
                  ${description ? `<p style="color: #4B5563; font-size: 14px; margin: 0;">${description}</p>` : ''}
                </div>
              `;
      }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Notes -->
      ${conversation.notes && conversation.notes.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">
            Notes (${conversation.notes.length})
          </h2>
          <div style="display: grid; gap: 15px;">
            ${conversation.notes.map((note: any) => {
        const category = note.category || note.note_type || 'GENERAL';
        const description = note.description || note.details;
        const borderColor = category === 'BUDGET' || category === 'BUDGET_REQUEST'
          ? '#10B981'
          : category === 'DECISION'
            ? '#3B82F6'
            : '#F59E0B';

        return `
                <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid ${borderColor};">
                  <div style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">
                    ${category.replace(/_/g, ' ')}
                  </div>
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">${note.title}</h3>
                  ${description ? `<p style="color: #4B5563; font-size: 14px; margin: 0;">${description}</p>` : ''}
                </div>
              `;
      }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Additional Analysis -->
      ${conversation.user_input && conversation.user_input_result ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">
            Additional Analysis
          </h2>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <p style="color: #1E40AF; font-weight: 600; margin-bottom: 10px; font-size: 14px;">
              Question: ${conversation.user_input}
            </p>
            <div style="color: #111827; white-space: pre-wrap; line-height: 1.6;">
              ${conversation.user_input_result.content || conversation.user_input_result.description}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Transcript -->
      ${conversation.raw_transcript ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">
            Full Transcript
          </h2>
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; color: #374151;">
            ${conversation.raw_transcript}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>Generated by Omni Listen — AI Personal Assistant</p>
        <p>Job ID: ${conversation.job_id}</p>
      </div>
    </div>
  `;

  // PDF options for better quality
  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `conversation_${conversation.job_id}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generate and download PDF directly
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().set(options as any).from(html).save();
  } catch (error) {
    console.error('Failed to generate PDF.');
  }
}

// Export queries to PDF
export async function exportQueriesToPDF(queries: any[]) {
  if (queries.length === 0) {
    console.warn('No queries to export');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px;">
        <h1 style="color: #4F46E5; margin: 0; font-size: 32px;">Additional Analysis History</h1>
        <p style="color: #666; margin-top: 10px; font-size: 14px;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
        <p style="color: #666; margin-top: 5px; font-size: 12px;">
          Total Queries: ${queries.length}
        </p>
      </div>

      <!-- Queries -->
      ${queries.map((query, index) => {
    const typeColors: Record<string, string> = {
      summary: '#3B82F6',
      analysis: '#8B5CF6',
      list: '#10B981',
      comparison: '#F59E0B',
      search: '#4F46E5',
      question: '#EC4899',
    };
    const borderColor = typeColors[query.type] || '#8B5CF6';

    return `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid ${borderColor};">
              <!-- Header -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                <div style="color: #6B7280; font-size: 12px;">
                  ${new Date(query.meetingDate).toLocaleDateString()} • ${new Date(query.meetingDate).toLocaleTimeString()}
                </div>
                <div style="background: ${borderColor}20; color: ${borderColor}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                  ${query.type.toUpperCase()}
                </div>
              </div>

              <!-- Question -->
              <div style="margin-bottom: 15px;">
                <h3 style="color: #4F46E5; font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                  Question
                </h3>
                <p style="color: #111827; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 500;">
                  ${query.question}
                </p>
              </div>

              <!-- Answer -->
              <div style="background: white; padding: 15px; border-radius: 6px;">
                <h3 style="color: #10B981; font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                  Analysis Result
                </h3>
                <div style="color: #374151; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">
                  ${query.answer}
                </div>
              </div>
            </div>
          </div>
        `;
  }).join('')}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>Generated by Omni Listen — AI Personal Assistant</p>
      </div>
    </div>
  `;

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `queries_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().set(options as any).from(html).save();
  } catch (error) {
    console.error('Failed to generate PDF.');
  }
}
