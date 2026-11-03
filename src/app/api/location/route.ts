import { NextResponse, type NextRequest } from "next/server";
import { parseLocation } from "@/lib/location";

// Remembers the visitor's town, county or postcode for the homepage spotlight. No sign-in, no geolocation.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const loc = parseLocation(url.searchParams.get("q"));
  const res = NextResponse.redirect(new URL("/#featured", url.origin));
  if (loc) res.cookies.set("av_loc", loc.label, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  else res.cookies.set("av_loc", "", { path: "/", maxAge: 0 });
  return res;
}
