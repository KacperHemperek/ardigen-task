import { Outlet } from "@tanstack/react-router";

export function BaseLayout() {
  return (
    <div className="p-4 flex flex-col">
      <Outlet />
    </div>
  );
}
