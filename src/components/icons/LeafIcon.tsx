import type { SVGProps } from 'react';

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 4 13V8a4.98 4.98 0 0 1 1-3l7-4 7 4c.47.27.8.71.95 1.21L20 13a7 7 0 0 1-9 7Z" />
      <path d="M11 20A7 7 0 0 1 4 13V8" />
      <path d="M13 19.75A7 7 0 0 0 20 13v-5" />
    </svg>
  );
}
