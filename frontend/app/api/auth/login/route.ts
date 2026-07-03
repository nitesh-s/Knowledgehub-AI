import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  return NextResponse.json(await res.json());
}
