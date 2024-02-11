import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("autorization");
  const expectedAuth = `Bearer ${process.env.PASSWORD}`;

  if (authHeader === expectedAuth) {
    return NextResponse.next();
  } else {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: ["/api/items", "/api/docx"],
};
