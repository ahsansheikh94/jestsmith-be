import { NextRequest, NextResponse } from "next/server";

interface Body extends ReadableStream<Uint8Array<ArrayBufferLike>> {
  sourceCode: string;
  description?: string;
}

interface Request extends NextRequest {
  body: Body;
}
// GET /api/users
export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    if (!body.sourceCode) {
      return NextResponse.json(
        { error: "Please provide the source code" },
        { status: 200 }
      );
    }

    const resp = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-classifier",
        messages: [
          {
            role: "system",
            content:
              "You are a senior javascript engineer who write tests for all sort of javascript or typescript (based on input) code (React, Next, Node, Nest, Angular and any other javascript framework)",
          },
          {
            role: "user",
            content: `
                You are an expert NestJS/Jest testing engineer.
                Write unit or integration test cases in Jest for the following TypeScript and/or JavaScript code. Make sure to write each and every test case possible ensuring atleast 90% code coverage of the given code.
                ${body.description ? `\nDescription: ${body.description}` : ""}
                \`\`\`ts
                ${body.sourceCode}
                \`\`\`
                Only output the test code. Do not explain anything. and output the code in text, DO NOT use any markdown syntax
            `,
          },
        ],
      }),
    });

    const { choices } = await resp.json();
    const testCode: string = choices[0].message.content;

    return NextResponse.json({ testCode }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
