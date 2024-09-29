import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Function to fetch shop data from the database (if necessary)
async function fetchShop(session, baseUrl) {
  try {
    const response = await fetch(
      `${baseUrl}/api/shop?email=${encodeURIComponent(session.user.email)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.shop || null;
  } catch (error) {
    console.log("Error in fetching shop in middleware:", error.message);
    throw new Error("Internal Server Error");
  }
}

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;
  const protectedRoutes = ["/shops/[shopName]"];
  const isProtectedRoute = protectedRoutes.some((route) => {
    const routePattern = new RegExp(`^${route.replace(/\[.+?\]/g, "[^/]+")}$`);
    return routePattern.test(pathname);
  });

  const session = await auth();

  // Retrieve shop presence status from cookies
  let shopPresent = request.cookies.get("shop_present")?.value; // Access cookie from request
  // console.log("middleware", isProtectedRoute, shopPresent);

  const response = NextResponse.next();

  try {
    if (!session?.user?.email) {
      if (shopPresent) {
        // console.log("deleting cookie");
        response.cookies.delete("shop_present", { path: "/" });
        // console.log("Cookie deleted");
      }

      // Redirect to sign-in if user is not authenticated and trying to access a protected page
      if (
        pathname !== "/sign-in" &&
        (isProtectedRoute || pathname === "/register")
      ) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } else {
      if (!shopPresent) {
        const currentShop = await fetchShop(session, origin);
        if (currentShop) {
          // console.log("adding cookie");
          response.cookies.set("shop_present", "true", {
            httpOnly: true,
            path: "/",
            maxAge: 3600, // Set cookie expiration (1 hour)
          });
          // console.log("Cookie added");
        } else if (pathname !== "/register" && pathname !== "/sign-out") {
          // If shop is authenticated but not registered, redirect to register
          return NextResponse.redirect(new URL("/register", request.url));
        }
      }
    }
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  // Redirect logged-in shops away from register or sign-in pages
  if (shopPresent && (pathname === "/register" || pathname === "/sign-in")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/shops/:shopName", // Protected route: middleware will run
    "/((?!api|_next/static|_next/image|images|icons|favicon.ico).*)", // Everything else (protected routes not listed above)
  ],
};
