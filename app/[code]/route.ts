import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET(
    req: Request,
    context: { params: Promise<{ code: string }> }
    ) {
    try {
        const { code } = await context.params;

        const link = await prisma.link.findUnique({
        where: { code },
        });

        // If link not found → 404 JSON
        if (!link) {
            return NextResponse.json(
            { error: "Short link not found" },{ status: 404 }
            );
        }
        // Update click count + last clicked time
        await prisma.link.update({
            where: { code },
            data: {
                totalClicks: link.totalClicks + 1,
                lastClicked: new Date(),
            },
        });

        // Redirect with 302
        return Response.redirect(link.targetUrl, 302);
    } catch (err) {
        console.error("Error in redirect handler:", err);
        return NextResponse.json(
        { error: "Server error" },{ status: 500 }
        );
    }
}
