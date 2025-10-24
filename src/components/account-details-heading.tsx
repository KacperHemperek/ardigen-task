import type React from "react";

export function AccountDetailsHeading({ children }: React.PropsWithChildren) {
  return <h3 className="text-xs mb-2 text-gray-500 uppercase">{children}</h3>;
}
