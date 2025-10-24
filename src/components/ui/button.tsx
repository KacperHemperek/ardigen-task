import { cn } from "../../lib/utils";

export type ButtonProps = React.PropsWithChildren &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-1 border border-gray-300 bg-gray-100 active:bg-gray-100 transition-colors rounded-md text-sm disabled:opacity-75 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
