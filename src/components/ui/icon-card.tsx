import React from "react";
import { cn } from "../../lib/utils";

export type IconCardProps = React.PropsWithChildren<{
  icon: React.ReactNode;
  className?: string;
}>;

export function IconCard({ icon, className, children }: IconCardProps) {
  return (
    <div
      className={cn("items-center py-2 px-4 bg-gray-200 rounded-lg", className)}
    >
      <div className="flex items-center">
        <div className="mr-4 text-gray-700">{icon}</div>
        {children}
      </div>
    </div>
  );
}
