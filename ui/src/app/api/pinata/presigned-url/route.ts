import { pinata } from "@/configs/pinata.config";
import { NextResponse } from "next/server";

export async function GET() {
  const url = await pinata.upload.public.createSignedURL({
    expires: 60,
  });

  return NextResponse.json({ url }, { status: 200 });
}
