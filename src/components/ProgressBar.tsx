"use client";

type Props = {
  percent: number;
  completedCount: number;
  total: number;
  progressLabel: string;
  onDark?: boolean;
};

export function ProgressBar({
  percent,
  completedCount,
  total,
  progressLabel,
  onDark = false,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-sm ${onDark ? "text-white/80" : "text-muted"}`}>
          <span
            className={`font-semibold ${onDark ? "text-white" : "text-foreground"}`}
          >
            {completedCount}
          </span>
          {" of "}
          <span
            className={`font-semibold ${onDark ? "text-white" : "text-foreground"}`}
          >
            {total}
          </span>
          {" "}
          {progressLabel}
        </p>
        <span
          className={`font-display text-lg ${onDark ? "text-white" : "text-accent"}`}
        >
          {percent}%
        </span>
      </div>
      <div
        className={`h-2 overflow-hidden rounded-full ${onDark ? "bg-white/20" : "bg-border"}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`progress-fill h-full rounded-full ${onDark ? "bg-white" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
