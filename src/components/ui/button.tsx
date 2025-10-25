import { cn } from "../../lib/utils";

export type ButtonProps = React.PropsWithChildren<
  { square?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
>;

export function Button({
  children,
  className,
  square = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-1 border border-gray-300 bg-gray-100 active:bg-gray-100 transition-colors rounded-md text-sm disabled:opacity-75 cursor-pointer",
        square && "aspect-square px-1 flex items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
