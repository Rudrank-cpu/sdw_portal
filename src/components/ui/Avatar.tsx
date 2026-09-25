interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md";
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dimensions = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return src ? (
    <img src={src} alt={name} className={`${dimensions} rounded-full object-cover`} />
  ) : (
    <span aria-label={name} className={`flex ${dimensions} items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300`}>
      {initials || "?"}
    </span>
  );
}
