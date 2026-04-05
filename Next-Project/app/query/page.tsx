"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function Chat() {
    const { isSignedIn } = useAuth();
    const target = useRef<HTMLInputElement>(null);
    const [response, setResponse] = useState("");
    const [msg, setMsg] = useState("");
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!isSignedIn){
            const val = localStorage.getItem("count");
            setCount(val ? Number(val) : 0);
        } else {
            setCount(0);
        }
    }, [isSignedIn]);

    useEffect(() => {
        if( !isSignedIn && typeof count === "number") {
            localStorage.setItem("count", String(count));
        }
    },[count, isSignedIn]);

    useEffect(() => {
        if (!isSignedIn && count >= 3) {
            setMsg("TRIAL EXPIRED. AUTHENTICATION REQUIRED.");
        } else {
            setMsg("");
        }
    }, [count, isSignedIn]);

    const handleSubmit = async () => {
        setLoading(true);
        if(count >= 3 && !isSignedIn){
            setLoading(false);
            return;
        }

        const val = target?.current?.value || "";
        if (!val.trim()) {
            setLoading(false);
            return;
        }
        
        try {
            const res = await axios.post("/api/chat", {
                userInput: val
            });
            setResponse(res.data.response);
            
            if(target.current) {
                target.current.value = "";
            }

            if(!isSignedIn){
                setCount(count+1);
            }
        } catch (e) {
            setResponse("Error: Unable to process request. Please check system status.");
            console.log(e)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-73px)] w-full bg-[#E6D5C3] text-[#1A1A1A] flex flex-col font-sans">

            <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20">
                
                {/* Header Section */}
                <div className="mb-16">
                    {/* <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4">
                        Query <span className="italic">Database</span>
                    </h1> */}
                    <p className="font-mono text-xs uppercase tracking-[0.15em] opacity-80 max-w-xl">
                        Enter pharmaceutical compound, symptom, or general medical inquiry to retrieve clinical data.
                    </p>
                </div>

                {/* Error Message */}
                {msg && (
                    <div className="border border-[#1A1A1A] p-4 mb-8 flex items-start gap-4 bg-[#E6D5C3]">
                        <div className="w-4 h-4 rounded-full border border-[#1A1A1A] flex items-center justify-center mt-0.5">
                            <span className="block w-1 h-1 bg-[#1A1A1A] rounded-full" />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-widest">{msg}</span>
                    </div>
                )}

                {/* Search Form - 3. Single-line search bar (1px bottom border only) */}
                <div className="mb-16 relative">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="relative flex items-end">
                        
                        <div className="flex-1 relative border-b border-[#1A1A1A] group">
                            <input 
                                type="text" 
                                ref={target} 
                                placeholder="E.g., Pharmacokinetics of Amoxicillin..." 
                                className="w-full bg-transparent border-none outline-none font-serif text-2xl md:text-3xl placeholder:text-[#1A1A1A]/40 text-[#1A1A1A] py-4 pr-4 transition-all focus:ring-0" 
                                disabled={count >= 3 && !isSignedIn}
                            />
                            {/* Accent node */}
                            <div className="absolute left-0 bottom-[-3px] w-1.5 h-1.5 bg-[#1A1A1A]" />
                            <div className="absolute right-0 bottom-[-3px] w-1.5 h-1.5 bg-[#1A1A1A]" />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="ml-6 flex-shrink-0 border border-[#1A1A1A] px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] hover:bg-[#1A1A1A] hover:text-[#E6D5C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3" 
                            disabled={count >= 3 && !isSignedIn}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-pulse">Processing</span>
                                </>
                            ) : (
                                <>
                                    <span>Execute</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                    
                    {/* Status Text under search */}
                    <div className="mt-4 flex justify-end font-mono text-[10px] uppercase tracking-widest opacity-60 font-extrabold">
                        {/* <span>Status: Awaiting Input</span> */}
                        <span >
                            {isSignedIn 
                                ? "Auth: Verified" 
                                : count < 3 
                                    ? `Auth: Guest (${3 - count}/3 Queries Remaining)` 
                                    : "Auth: Blocked (Limit Exceeded)"}
                        </span>
                    </div>
                </div>

                {/* 4. Data Cards: Structured grid of results, flat parchment, sharp borders, mono labels */}
                {response && (
                    <div className="border border-[#1A1A1A] bg-[#E6D5C3] shadow-none">
                        <div className="border-b border-[#1A1A1A] px-6 py-3 bg-[#1A1A1A] text-[#E6D5C3] flex items-center justify-between">
                            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
                                <span className="block w-2 h-2 rounded-full border border-[#E6D5C3] bg-[#E6D5C3]" />
                                <span>Clinical Output</span>
                            </div>
                            {/* <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">REF: {Date.now().toString().slice(-6)}</span> */}
                        </div>
                        
                        <div className="p-8 md:p-12">
                            <div className="prose prose-p:font-sans prose-headings:font-serif prose-headings:font-normal prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-[#1A1A1A] prose-a:underline prose-a:decoration-1 prose-a:underline-offset-4 prose-strong:font-semibold prose-strong:text-[#1A1A1A] text-[#1A1A1A] max-w-none">
                                <ReactMarkdown>{response}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}