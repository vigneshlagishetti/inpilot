import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Review {
  id: string
  user_name: string
  user_email: string
  rating: number
  text: string
  created_at: string
}

export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json()
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        id: reviewData.id,
        user_name: reviewData.userName,
        user_email: reviewData.userEmail,
        rating: reviewData.rating,
        text: reviewData.text,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    return NextResponse.json({ success: true, review: data?.[0] })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { reviewId } = await request.json()
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}