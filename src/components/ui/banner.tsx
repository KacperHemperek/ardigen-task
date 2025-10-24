import { cn } from "../../lib/utils";

type BannerProps = {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function Banner({ className, icon, title, subtitle }: BannerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex flex-col items-center text-center",
        className,
      )}
    >
      {icon}
      <h3 className="text-gray-700">{title}</h3>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}
