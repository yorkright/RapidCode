"use client";
import React from "react";

const Loader = () => {
  return (
    // This is correctly sized to wrap the loader, allowing the parent's background to show through.
    <div className="flex justify-center items-center">
      <div className="loader relative rounded-full" style={{ "--size": 1 }}>
        {/* SVG and mask remains here */}
        <svg
          width={100}
          height={100}
          viewBox="0 0 100 100"
          className="absolute"
        >
          <defs>
            <mask id="clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="box w-[100px] h-[100px]" />
      </div>
    </div>
  );
};

export default Loader;