type Props = {
  current: number;
  total: number;
  label: string;
};

export function StepIndicator({ label }: Props) {
  return (
    <p
      className="text-base font-medium text-muted sm:text-lg"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
