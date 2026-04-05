"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-73px)] relative overflow-hidden flex flex-col">
      {/* Grid Pattern Background - faint */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#1A1A1A 1px, transparent 1px),
            linear-gradient(90deg, #1A1A1A 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Structural left line */}
      <div className="absolute left-8 md:left-24 top-0 bottom-0 w-[1px] bg-[#1A1A1A] z-0 hidden md:block" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-24 pt-20 pb-24 md:pt-20 flex-1 flex flex-col justify-center">
        
        {/* Top Info line */}
        <div className="flex items-center gap-4 mb-8 font-mono text-xs uppercase tracking-[0.2em] text-[#1A1A1A] opacity-70">
          {/* <span>Vol. 1</span> */}
          <div className="w-12 h-[1px] bg-[#1A1A1A]"></div>
          <span>Digital Solutions</span>
        </div>

        {/* 2. Hero: Massive serif headline */}
        <h1 className="font-serif text-6xl md:text-[7rem] lg:text-[8.5rem] leading-[0.9] text-[#1A1A1A] tracking-tighter mb-12">
          The Clinical <br />
          <span className="italic">Curator.</span>
        </h1>

        {/* Thin horizontal rule with a circular node */}
        <div className="w-full flex items-center mb-12">
          <div className="w-2 h-2 rounded-full border border-[#1A1A1A] bg-[#1A1A1A]" />
          <div className="flex-1 h-[1px] bg-[#1A1A1A]" />
          <div className="w-2 h-2 rounded-full border border-[#1A1A1A] bg-[#E6D5C3]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          <div className="md:col-span-4 flex flex-col justify-start">
            <div className="relative self-center md:self-start md:ml-4 lg:ml-8 mt-2 md:mt-0 w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-52 lg:h-52">
              <Image
                src="/molecule.svg"
                alt="molecule"
                fill
                className="object-contain opacity-90"
                priority
              />
            </div>
          </div>
          
          {/* Right Column - Justified subtitle and CTA */}
          <div className="md:col-span-8 flex flex-col items-start">
            <p className="text-[#1A1A1A] text-lg md:text-xl font-sans leading-relaxed text-justify mb-12 max-w-2xl">
              AI-powered pharmaceutical intelligence engineered to streamline complex clinical workflows, optimize data retrieval, and enhance evidence-based patient care standards across medical institutions.
            </p>

            <Link href="/query">
              <span className="group inline-flex items-center gap-4 border border-[#1A1A1A] px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] hover:bg-[#1A1A1A] hover:text-[#E6D5C3] transition-colors cursor-pointer">
                <span>Initialize Query</span>
                <span className="w-8 h-[1px] bg-[#1A1A1A] group-hover:bg-[#E6D5C3] transition-colors" />
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom meta bar */}
      <div className="w-full border-t border-[#1A1A1A] px-8 md:px-30 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between">
        <span>Pharmasage Systems</span>
        <span>SYS. ON</span>
      </div>
    </div>
  );
}