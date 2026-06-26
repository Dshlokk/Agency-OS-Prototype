import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER; // Twilio phone number or whatsapp:TwilioNumber

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ 
      error: 'Twilio configuration is missing. Please define TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env.local file.' 
    }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { to, message, channel } = body; // channel: 'sms' | 'whatsapp'

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const isWhatsApp = channel === 'whatsapp' || to.startsWith('whatsapp:');
    const formattedTo = isWhatsApp && !to.startsWith('whatsapp:') ? `whatsapp:${to}` : to;
    const formattedFrom = isWhatsApp && !fromNumber.startsWith('whatsapp:') ? `whatsapp:${fromNumber}` : fromNumber;

    // Standard Basic Authorization header for Twilio
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', formattedFrom);
    formData.append('Body', message);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS/WhatsApp via Twilio');
    }

    return NextResponse.json({ success: true, sid: data.sid });
  } catch (error: any) {
    console.error('Error sending SMS/WhatsApp:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
