interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/**
 * Thin wrapper around Google Material Symbols so pages stay decoupled
 * from the icon font implementation.
 */
export default function Icon({ name, className = "", filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${filled ? "fill" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
