import { Outlet } from "@tanstack/react-router";

export function BaseLayout() {
  return (
    <div className="mx-auto p-4 flex flex-col md:px-16 md:py-8 md:max-w-3xl">
      <Outlet />
    </div>
  );
}
