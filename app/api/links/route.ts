import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";

// Characters allowed to make the shortened codes.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//Function to generate the short link with (allowed)random characters

function generateCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, code } = body;

        // 1. Validate URL
        try {
            new URL(url);
        }catch (err) {
            console.log("error in Backend links'POST routets: ",err);
            return NextResponse.json(
                { error: "Invalid URL format" },{ status: 400 }
            );
        }
        //If user provided custom code, validate & check from database
        let finalCode = code;

        if (finalCode) {
            const already = await prisma.link.findUnique({
                where: { code: finalCode },
            });

            if (already) {
            return NextResponse.json(
                { error: "Custom code already exists" },{ status: 409 }
                );
            }
        }

        // 3. If no custom code, generate unique one
        if (!finalCode) {
            while (true) {
                const generated = generateCode(6);

                const exists = await prisma.link.findUnique({
                    where: { code: generated },
                });

                if (!exists) {
                    finalCode = generated;
                    break;
                }
            }
        }

        // 4. Save to database
        const link = await prisma.link.create({
            data: {
                code: finalCode,
                targetUrl: url,
            },
        });

        return NextResponse.json(
        {
            message: "Short link created",
            code: link.code,
            shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${link.code}`,
        },
        { status: 201 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Server error" },{ status: 500 }
        );
    }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (err) {
    console.log("error in Backend links' GET method: ",err);
    return NextResponse.json(
      { error: "Error fetching links" },
      { status: 500 }
    );
  }
}