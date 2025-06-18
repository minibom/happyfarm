'use client';

import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

export default function ClientOnlyLeafBackground() {
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  if (!isClientMounted) {
    return null; // Or a static placeholder
  }

  return (
    <div className="absolute inset-0 opacity-20">
      {[...Array(20)].map((_, i) => (
        <Leaf
          key={i}
          className="absolute text-green-400 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `scale(${Math.random() * 1 + 0.5}) rotate(${Math.random() * 360}deg)`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
          size={Math.random() * 80 + 20}
        />
      ))}
    </div>
  );
}
