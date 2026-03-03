import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const authUser = getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: {
        userId: authUser.userId,
        name: authUser.name,
        email: authUser.email,
        
      },
    },
    { status: 200 }
  );
}
