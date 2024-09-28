"use client";
import { redirect, usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, resolveUrl } from "@/utils";
import { default_avatar } from "@/constants";

export default function Navbar({ session }) {
  const pathname = usePathname();
  const user = session?.user;

  const excludedRoutes = [
    "/",
    "/sign-in",
    "/sign-out",
    "/register",
    "/not-found",
  ];

  return excludedRoutes.includes(pathname) ? null : user ? (
    <NavbarComponent user={user} />
  ) : (
    redirect("/sign-in")
  );
}

function NavbarComponent({ user }) {
  return (
    <div className="flex justify-end px-10">
      <Avatar className="ml-3 size-7 text-foreground">
        <AvatarImage src={resolveUrl(user.image, default_avatar)} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </div>
  );
}
