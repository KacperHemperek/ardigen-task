import { cn } from "../../lib/utils";

export type PillProps = { className?: string } & React.PropsWithChildren;

export function Pill({ className, children }: PillProps) {
  return (
    <span
      className={cn(
        "flex items-center px-2 py-0.5 rounded-full text-xs font-medium border max-w-fit border-gray-500 bg-gray-200 text-gray-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
