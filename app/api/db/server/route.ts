import { prisma } from "@/prisma/db";
import { type Server } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const guildId = "1071217231515615282";

// see issue https://github.com/vercel/next.js/discussions/50497
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await prisma.server.findUnique({
      where: {
        guildId: guildId,
      },
    });

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function POST(req: NextRequest) {
  //if(typeof await req.json() !==  Partial<Server>) return NextResponse.error()
  const data = (await req.json()) as Partial<Server>;
  try {
    if (data.adminRoleIds && data.adminRoleIds.length < 1) {
      return NextResponse.json(
        { error: "Error. One admin role required" },
        { status: 500 }
      );
    }

    revalidateTag("server");

    const res = await prisma.server.upsert({
      where: {
        guildId: guildId,
      },
      update: {
        ...data,
      },
      create: {
        ...data,
        guildId: guildId,
      },
    });

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.error();
  }
}
