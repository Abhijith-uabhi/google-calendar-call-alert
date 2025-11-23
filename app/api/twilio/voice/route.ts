// app/api/twilio/voice/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const eventName = searchParams.get('event') || 'Untitled Event';
  const eventTime = searchParams.get('time') || 'soon';

  // Create TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello! This is your calendar reminder from Google Alert System.
  </Say>
  <Pause length="1"/>
  <Say voice="alice">
    You have an upcoming event: ${escapeXml(eventName)}.
  </Say>
  <Pause length="1"/>
  <Say voice="alice">
    It starts at ${escapeXml(eventTime)}.
  </Say>
  <Pause length="1"/>
  <Say voice="alice">
    Have a great day!
  </Say>
</Response>`;

  // Return TwiML with proper content type
  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export async function POST(request: NextRequest) {
  // Twilio will POST to this endpoint when call is answered
  // Handle the same way as GET
  return GET(request);
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}