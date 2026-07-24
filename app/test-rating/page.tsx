"use client";
import React, { useState } from 'react';
import StarRating from '@/components/ui/StarRating';

export default function TestRatingPage() {
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Star Rating Test</h1>
      <StarRating value={rating} onChange={setRating} />
      <div className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        Current rating: {rating === 0 ? 'None' : rating}
      </div>
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Tap a star to set rating. Tap the same star again to clear.</p>
    </div>
  );
}
