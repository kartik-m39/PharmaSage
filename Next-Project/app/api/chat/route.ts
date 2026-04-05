import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){

    const azureEndPoint = process.env.AZURE_API_ENDPOINT as string

    const { userInput } = await req.json();

    try {

        const res = await axios.post(azureEndPoint, {
            query: `${userInput}`,
            mode: "llm"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const RagResponse = res.data.response;
        return NextResponse.json({response: RagResponse});

    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to process request" }, 
            { status: 500 }
        );
    }
};
