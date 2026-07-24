import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import mammoth from 'mammoth'
const PDFParser = require('pdf2json')

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileName = file.name.toLowerCase()
        let extractedText = ''

        // Extract text based on file type
        if (fileName.endsWith('.pdf')) {
            // Handle PDF files
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            try {
                console.log('Parsing PDF with buffer size:', buffer.length)

                // Use pdf2json which is simpler and more reliable
                const pdfParser = new PDFParser()

                extractedText = await new Promise((resolve, reject) => {
                    pdfParser.on('pdfParser_dataError', (errData: any) => {
                        console.error('PDF parse error:', errData.parserError)
                        reject(new Error(errData.parserError))
                    })

                    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                        try {
                            // Extract text from all pages manually
                            let allText = ''

                            if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                                pdfData.Pages.forEach((page: any) => {
                                    if (page.Texts && Array.isArray(page.Texts)) {
                                        page.Texts.forEach((textItem: any) => {
                                            if (textItem.R && Array.isArray(textItem.R)) {
                                                textItem.R.forEach((run: any) => {
                                                    if (run.T) {
                                                        try {
                                                            // Decode URI component (pdf2json encodes text)
                                                            const decodedText = decodeURIComponent(run.T)
                                                            allText += decodedText + ' '
                                                        } catch (decodeError) {
                                                            // If decoding fails, use the raw text
                                                            allText += run.T + ' '
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                        allText += '\n' // Add newline after each page
                                    }
                                })
                            }

                            console.log('Extracted text length:', allText.length)
                            resolve(allText)
                        } catch (err) {
                            console.error('Error extracting text from pdfData:', err)
                            reject(err)
                        }
                    })

                    // Parse the buffer
                    pdfParser.parseBuffer(buffer)
                })

                // Clean up the text - remove excessive whitespace while preserving structure
                extractedText = extractedText
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n')

                console.log('PDF parsed successfully. Text length:', extractedText.length)
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError)
                return NextResponse.json(
                    { error: 'Failed to parse PDF. The file may be corrupted or password-protected.' },
                    { status: 400 }
                )
            }
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            // Handle DOCX files
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            try {
                const result = await mammoth.extractRawText({ buffer })
                extractedText = result.value

                // Clean up the text
                extractedText = extractedText
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n')

                console.log('DOCX parsed successfully. Length:', extractedText.length)

                if (result.messages.length > 0) {
                    console.log('Mammoth warnings:', result.messages)
                }
            } catch (docxError) {
                console.error('DOCX parsing error:', docxError)
                return NextResponse.json(
                    { error: 'Failed to parse DOCX. The file may be corrupted.' },
                    { status: 400 }
                )
            }
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF or DOCX.' },
                { status: 400 }
            )
        }

        // Validate that we extracted some text
        if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json(
                { error: 'No text could be extracted from the file. The file may be empty or contain only images.' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            text: extractedText,
            fileName: file.name,
            size: extractedText.length
        })
    } catch (error: any) {
        console.error('Error in extract-text API:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to extract text from file' },
            { status: 500 }
        )
    }
}

// Increase timeout for file processing
export const maxDuration = 30
