import React, { useState } from 'react';

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ value = 0, onChange, max = 5, className = '' }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleClick = (star: number) => {
    if (onChange) {
      if (star === value) {
        onChange(0); // Clear rating if same star is clicked
      } else {
        onChange(star);
      }
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = hovered !== null ? starValue <= hovered : starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            className={`focus:outline-none transition-transform duration-100 ${filled ? 'scale-110' : ''}`}
          >
            <svg
              className={`w-7 h-7 sm:w-8 sm:h-8 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17.25l-6.16 3.73 1.64-7.03L2 9.51l7.19-.61L12 2.75l2.81 6.15 7.19.61-5.48 4.44 1.64 7.03z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
