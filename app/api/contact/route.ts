import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string
    
    // Get files if any
    const files: { name: string; content: Buffer; mimetype: string }[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        const buffer = await value.arrayBuffer()
        files.push({
          name: value.name,
          content: Buffer.from(buffer),
          mimetype: value.type
        })
      }
    }

    // Create transporter (using SendGrid)
    // Note: You'll need to set up SENDGRID_API_KEY in your environment variables
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey', // this is literally the string 'apikey'
        pass: process.env.SENDGRID_API_KEY
      }
    })

    // Email content (to admin)
    const htmlContent = `
      <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif;background:#f9f9f9;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px #0001;">
        <div style="background:#4f46e5;padding:24px 0;text-align:center;">
          <img src="https://inpilot.vigneshlagishetti.me/inpilot-logo.png" alt="Inpilot Logo" width="120" height="63" style="display:block;margin:0 auto 8px;border-radius:8px;object-fit:cover;"/>
          <h1 style="color:#fff;margin:0;font-size:2rem;letter-spacing:1px;">Impilot</h1>
        </div>
        <div style="padding:32px 24px 24px 24px;background:#fff;">
          <h2 style="color:#4f46e5;margin-top:0;">New Contact Form Submission</h2>
          <div style="background:#f3f4f6;padding:16px 18px;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0 0 8px 0;font-weight:bold;">Contact Details:</p>
            <div style="color:#333;">Name: <b>${name}</b></div>
            <div style="color:#333;">Email: <b>${email}</b></div>
          </div>
          <div style="background:#f8fafc;padding:16px 18px;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0 0 8px 0;font-weight:bold;">Message:</p>
            <div style="color:#333;white-space:pre-line;">${message}</div>
          </div>
          ${files.length > 0 ? `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #333; margin-top: 0;">Attachments</h3>
              <p>${files.length} file(s) attached: ${files.map(f => f.name).join(', ')}</p>
            </div>
          ` : ''}
          <p style="font-size:0.95rem;color:#666;margin-top:32px;">This message was sent from the Inpilot contact form.<br/>Sent at: ${new Date().toLocaleString()}</p>
        </div>
        <div style="background:#f3f4f6;padding:12px;text-align:center;font-size:0.85rem;color:#888;">
          &copy; ${new Date().getFullYear()} Impilot. All rights reserved.
        </div>
      </div>
    `

    // Email options
    const mailOptions = {
      from: 'lvigneshbunty789@gmail.com',
      to: 'lvigneshbunty789@gmail.com',
      subject: `Inpilot Contact: Message from ${name}`,
      html: htmlContent,
      replyTo: email,
      attachments: files.map(file => ({
        filename: file.name,
        content: file.content,
        contentType: file.mimetype
      }))
    }


    // Send email to admin (yourself)
    try {
      await transporter.sendMail(mailOptions)
    } catch (smtpError) {
      console.error('SMTP sendMail error:', smtpError);
      throw smtpError;
    }

    // Send confirmation email to user (only if email is valid)
    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      const confirmMailOptions = {
        from: 'lvigneshbunty789@gmail.com',
        to: email,
        subject: 'Thank you for contacting Inpilot!',
        html: `
          <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif;background:#f9f9f9;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px #0001;">
            <div style="background:#4f46e5;padding:24px 0;text-align:center;">
              <img src="https://inpilot.vigneshlagishetti.me/inpilot-logo.png" alt="Inpilot Logo" width="120" height="63" style="display:block;margin:0 auto 8px;border-radius:8px;object-fit:cover;"/>
              <h1 style="color:#fff;margin:0;font-size:2rem;letter-spacing:1px;">Inpilot</h1>
            </div>
            <div style="padding:32px 24px 24px 24px;background:#fff;">
              <h2 style="color:#4f46e5;margin-top:0;">Thank you for reaching out!</h2>
              <p style="font-size:1.1rem;">Hi${name ? ` <b>${name}</b>` : ''},</p>
              <p style="margin-bottom:24px;">We have received your message and will get back to you as soon as possible.</p>
              <div style="background:#f3f4f6;padding:16px 18px;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-weight:bold;">Your message:</p>
                <div style="color:#333;white-space:pre-line;">${message}</div>
              </div>
              <p style="font-size:0.95rem;color:#666;">If you have any urgent questions, feel free to reply to this email.</p>
              <p style="margin-top:32px;font-size:0.95rem;color:#888;">Best regards,<br/>The Inpilot Team</p>
            </div>
            <div style="background:#f3f4f6;padding:12px;text-align:center;font-size:0.85rem;color:#888;">
              &copy; ${new Date().getFullYear()} Inpilot. All rights reserved.
            </div>
          </div>
        `
      };
      try {
        await transporter.sendMail(confirmMailOptions);
      } catch (userMailError) {
        console.error('Error sending confirmation email to user:', userMailError);
        // Do not throw, so admin still gets notified
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    })
    
  } catch (error) {
    console.error('Error sending email:', error)
    // Return the error message for debugging (remove in production)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email. Please try again later.',
        debug: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}