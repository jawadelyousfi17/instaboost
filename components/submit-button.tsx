"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SubmitButton({
  label,
  loadingLabel,
  className,
  style,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={style}
    >
      {pending ? (loadingLabel ?? "Loading…") : label}
    </button>
  );
}
