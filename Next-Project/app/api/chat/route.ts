import axios from "axios";
// import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
// import path from "path";

export async function POST(req: NextRequest){
    
    const groqApiEndpoint = process.env.GROQ_API_ENDPOINT;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiEndpoint || !groqApiKey) {
        return NextResponse.json({ error: "API configuration missing" }, { status: 500 });
    }


    // let data;
    // try {
    //     // need to specify the path of the file
    //     const filePath = path.join(process.cwd(), "files", "MedData.json");
    //     data = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

    // } catch (error) {
    //     console.error("Error loading JSON file:", error);
    //     data = [];
    // }


    const { userInput } = await req.json();

    try {
        const response = await axios.post(groqApiEndpoint, {
        model: "llama-3.3-70b-versatile",  // Specify which model to use
        messages: [
            // { 
            //     role: "system", 
            //     content: `You are a medical assistant. Use this reference data: ${JSON.stringify(data)}`
            // },
            {
                role: "system",
                content: "You are a medical assistant. \nYou will answer according to the reference data that i will provide. Do not answer the question apart from medical field.\nalso add a disclaimer to the user that you are just a medical assistance and whatever response you are providing to user is in accordance with the data from the given referal website and one should always refer to doctor for any serious issues.\nIncrease the response size a bit and shorten the disclaimer. Also plz do not mention of the website in the response instead\n Always use this reference link for all the responses:\nhttps://www.nhs.uk/medicines\n"
            },
            { 
                role: "user", 
                content: `${userInput}` 
            } // can also give extra info to answer accordingly like content: `${userInput}, answer politely`
        ],
        }, {
        headers: {
            'Authorization': `Bearer ${groqAwpiKey}`,
            'Content-Type': 'application/json'
        }
        });
        
        // The response format will be different, need to extract the content
        const botresponse = response.data.choices[0].message.content;
        // console.log(botresponse);
        return NextResponse.json({response: botresponse});

    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to process request" }, 
            { status: 500 }
        );
    }
};
