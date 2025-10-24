import { cn } from "../../lib/utils";

type Size = "sm" | "lg";

export type AvatarProps = {
  src: string;
  size?: Size;
  alt?: string;
  className?: string;
};

export function Avatar({
  src,
  size = "sm",
  alt = "User's avatar",
  className,
}: AvatarProps) {
  const sizeVariants: Record<Size, string> = {
    sm: "w-10 h-10",
    lg: "w-18 h-18",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover rounded-full", sizeVariants[size], className)}
    />
  );
}
