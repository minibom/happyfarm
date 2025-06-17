'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-semibold mb-4 text-destructive">
        Có lỗi xảy ra! (Something went wrong!)
      </h2>
      <p className="mb-6 text-muted-foreground">
        Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại.
        (We apologize for the inconvenience. Please try again.)
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-primary hover:bg-primary/90"
      >
        Thử Lại (Try again)
      </Button>
    </div>
  );
}
