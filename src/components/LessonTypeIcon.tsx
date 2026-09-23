import type { ItemType } from "@/lib/types";

type Props = {
  type: ItemType;
  className?: string;
};

export function LessonTypeIcon({ type, className = "h-5 w-5" }: Props) {
  if (type === "activity") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 3.75h6.2L19.25 8.8V19.5A1.75 1.75 0 0 1 17.5 21.25H8A1.75 1.75 0 0 1 6.25 19.5V5.5A1.75 1.75 0 0 1 8 3.75Z" />
        <path d="M14.2 3.75V8.8h5.05" />
        <path d="M9.25 13h5.5M9.25 16.5h3.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.25" />
      <path
        d="M10.2 9.3v5.4l4.7-2.7-4.7-2.7Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
