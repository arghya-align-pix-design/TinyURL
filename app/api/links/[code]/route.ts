import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: NextRequest,
        context: { params: Promise<{ code: string }> }
    )
{
  try {
    const { code } = await context.params;

    const link = await prisma.link.findUnique({
        where: { code },
    });

    if (!link) {
        return NextResponse.json(
            { error: "Short link not found" },{ status: 404 }
        );}

        return NextResponse.json(link);
    } catch (err) {
        console.log("error happened in backend links/[code]'s GET route.ts: ",err);
    return NextResponse.json(
            { error: "Server error" },{ status: 500 }
        );
    }
}

// DELETE: /api/links/:code → Delete link
export async function DELETE(
        req: NextRequest,
        context: { params: Promise<{ code: string }> }
    ) {
    try {
        const { code } = await context.params;

        const link = await prisma.link.findUnique({
            where: { code },
        });

        if (!link) {
            return NextResponse.json(
            { error: "Short link not found" },
            { status: 404 }
            );
        }

    await prisma.link.delete({
        where: { code },
    });

    return NextResponse.json(
        { message: "Short link deleted" },{ status: 200 }
    );
    } catch (err) {
                console.log("error happened in backend links/[code]'s DELETE route.ts: ",err);
        return NextResponse.json(
            { error: "Server error" },{ status: 500 }
        );
    }
}