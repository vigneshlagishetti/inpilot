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

    // Create transporter (using Gmail SMTP, port 587, secure: false)
    // Note: You'll need to set up environment variables for email credentials
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
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
      from: email,
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

    // Send email
    try {
      await transporter.sendMail(mailOptions)
    } catch (smtpError) {
      console.error('SMTP sendMail error:', smtpError);
      throw smtpError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    })
    
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email. Please try again later.' 
      }, 
      { status: 500 }
    )
  }
}