import React from "react";

const HEADER_BG = "bg-white";
const BORDER_COLOR = "border-slate-200";

export default function HeaderofMainChat({title}) {
  return (
    <div>
      <header
        className={`sticky top-0 z-10 ${HEADER_BG} border-b ${BORDER_COLOR} px-4 py-3`}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative">
          {/* Centered Text */}
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center 
                     bg-clip-text text-transparent bg-linear-to-r from-black via-green-600 to-black 
                     drop-shadow-lg select-none tracking-tight leading-tight mx-auto"
          >
            {title || "RapidCode AI Assistant"}
          </h2>

        </div>
      </header>
    </div>
  );
}
