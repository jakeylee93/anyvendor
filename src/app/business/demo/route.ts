import { NextResponse } from "next/server";

// Lets people look around a clearly labelled demo business even when accounts are switched on.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const exit = url.searchParams.get("exit") === "1";
  const res = NextResponse.redirect(new URL(exit ? "/business/login" : "/business", url.origin));
  if (exit) res.cookies.delete("av_demo");
  else res.cookies.set("av_demo", "1", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  return res;
}
