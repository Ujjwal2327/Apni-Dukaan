"use client";
import { permanentRedirect, usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, resolveUrl } from "@/utils";
import { default_avatar } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ session }) {
  const pathname = usePathname();
  const user = session?.user;

  const excludedRoutes = ["/", "/sign-in", "/sign-out", "/not-found"];

  return excludedRoutes.includes(pathname) ? null : user ? (
    <NavbarComponent user={user} />
  ) : (
    permanentRedirect("/sign-in")
  );
}

function NavbarComponent({ user }) {
  const router = useRouter();
  return (
    <div className="flex justify-end px-10">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="ml-3 size-7 text-foreground">
            <AvatarImage src={resolveUrl(user.image, default_avatar)} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              router.push("/sign-out");
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
