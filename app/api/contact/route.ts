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

    // Email content
    const htmlContent = `
      <h2>New Contact Form Submission from Impilot</h2>
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        ${files.length > 0 ? `
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #333; margin-top: 0;">Attachments</h3>
            <p>${files.length} file(s) attached: ${files.map(f => f.name).join(', ')}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px; font-size: 12px; color: #666;">
          <p>This message was sent from the Impilot contact form.</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `

    // Email options
    const mailOptions = {
      from: 'lvigneshbunty789@gmail.com',
      to: 'lvigneshbunty789@gmail.com',
      subject: `Impilot Contact: Message from ${name}`,
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

    // Send confirmation email to user
    if (email) {
      const confirmMailOptions = {
        from: 'lvigneshbunty789@gmail.com',
        to: email,
        subject: 'Thank you for contacting Impilot!',
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <hr />
          <p><strong>Your message:</strong></p>
          <blockquote style="background:#f8f9fa;padding:10px;border-radius:6px;">${message}</blockquote>
          <p>Best regards,<br/>Impilot Team</p>
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