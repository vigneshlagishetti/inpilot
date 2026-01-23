import { NextRequest, NextResponse } from 'next/server'

interface Review {
  id: string
  userName: string
  userEmail: string
  rating: number
  text: string
  timestamp: string
}

// In-memory storage (in production, use a real database)
let reviews: Review[] = []

export async function GET() {
  return NextResponse.json({ reviews })
}

export async function POST(request: NextRequest) {
  try {
    const review: Review = await request.json()
    reviews.unshift(review) // Add to beginning
    return NextResponse.json({ success: true, review })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { reviewId } = await request.json()
    reviews = reviews.filter(review => review.id !== reviewId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}