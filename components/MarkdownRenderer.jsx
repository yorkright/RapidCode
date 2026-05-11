// components/MarkdownRenderer.jsx
"use client";


import React, { memo, useCallback, useRef, useMemo, Suspense, lazy, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Calculator, Quote, ExternalLink, Terminal, ChevronRight, ChevronDown, ChevronUp, Info } from "lucide-react";


import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";


import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";


// Lazy load heavy math rendering
const BlockMath = lazy(() => import("react-katex").then(mod => ({ default: mod.BlockMath })));
const InlineMath = lazy(() => import("react-katex").then(mod => ({ default: mod.InlineMath })));


// --------------------------------------------
// SANITIZATION EXTENSION
// --------------------------------------------
const extendedSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes || {}),
    code: [
      ...(defaultSchema.attributes?.code || []),
      ["className", /^language-.*$/],
      ["className", "math-inline", "math-display"],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["className", "katex", "katex-display", "katex-html"],
      ["title"],
    ],
  },
};


// --------------------------------------------
// FORMULA META DATA
// --------------------------------------------
const FORMULA_INTELLIGENCE = {
  sharpe: {
    explain: "Measures excess return per unit of risk taken.",
    use: "Compare portfolios with different risk levels.",
    mistake: "Avoid comparing Sharpe ratios across non-comparable assets.",
    level: "Intermediate",
  },
  volatility: {
    explain: "Measures the fluctuation of returns around the mean.",
    use: "Understand risk and price instability.",
    mistake: "Higher volatility doesn't always mean worse investment.",
    level: "Beginner",
  },
};


// Detect formula type
const detectFormulaType = (formula) => {
  if (/Sharpe|R_p.*R_f/.test(formula)) return "sharpe";
  if (/σ|variance/.test(formula)) return "volatility";
  return "generic";
};


// --------------------------------------------
// COMPONENTS
// --------------------------------------------


const CopyButton = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);


  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 ${className}`}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};


const MathBlock = ({ value, index }) => {
  const type = detectFormulaType(value);
  const meta = FORMULA_INTELLIGENCE[type];


  return (
    <div className="my-8 overflow-hidden transition-all bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-indigo-600 rounded-lg bg-indigo-100/50 ring-1 ring-indigo-200/50">
            <Calculator size={16} />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Model {index}
          </span>
        </div>
        <CopyButton text={value} className="px-2 py-1 bg-white border rounded shadow-sm text-slate-400 hover:text-indigo-600 border-slate-200" />
      </div>
      
      {/* Math Display */}
      <div className="px-6 py-10 overflow-x-auto text-center bg-white">
        <Suspense fallback={<div className="py-2 text-sm text-center text-slate-400">Rendering formula...</div>}>
          <BlockMath math={value} errorColor="#ef4444" />
        </Suspense>
      </div>


      {/* Intelligence Panel */}
      {meta && (
        <div className="grid gap-4 px-5 py-4 text-sm border-t border-slate-100 bg-slate-50/50 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600">
              <Info size={12} /> Explanation
            </span>
            <p className="leading-relaxed text-slate-600">{meta.explain}</p>
          </div>
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
              <Check size={12} /> Usage
            </span>
            <p className="leading-relaxed text-slate-600">{meta.use}</p>
          </div>
          <div className="pt-3 mt-1 border-t col-span-full border-slate-200/60">
            <span className="mr-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Caution</span>
            <span className="text-xs text-slate-500">{meta.mistake}</span>
          </div>
        </div>
      )}
    </div>
  );
};


const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const match = /language-(\w+)/.exec(className || "");


  if (inline || !match) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[0.85em] border border-slate-200 font-medium" {...props}>
        {children}
      </code>
    );
  }


  return (
    <div className="my-6 rounded-xl overflow-hidden bg-[#0d1117] shadow-xl border border-slate-800/50 group ring-1 ring-white/10">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-medium text-slate-400 select-none flex items-center gap-1.5 font-mono">
            <Terminal size={10} /> {match[1]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <CopyButton text={String(children).replace(/\n$/, "")} className="text-slate-400 hover:text-white" />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 transition-colors rounded text-slate-400 hover:text-white hover:bg-slate-700/50"
            aria-label={isCollapsed ? "Expand code" : "Collapse code"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-4 overflow-x-auto">
          <code className={`${className} bg-transparent p-0 text-sm font-mono leading-relaxed`} {...props}>
            {children}
          </code>
        </div>
      )}
    </div>
  );
};


const MarkdownRenderer = memo(({ text }) => {
  const equationCounter = useRef(0);
  // Reset counter when text changes to ensure consistent numbering for the same content
  useMemo(() => { equationCounter.current = 0; }, [text]);


  const renderBlockMath = useCallback((value) => {
    equationCounter.current += 1;
    return <MathBlock value={value} index={equationCounter.current} />;
  }, []);


  const components = useMemo(() => ({
    h1: (props) => (
      <h1 className="mt-10 mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900" {...props} />
    ),
    h2: (props) => (
      <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight sm:text-3xl text-slate-800" {...props} />
    ),
    h3: (props) => (
      <h3 className="flex items-center gap-2 mt-8 mb-3 text-xl font-semibold tracking-tight sm:text-2xl text-slate-800" {...props}>
        <span className="inline-block w-1 h-5 bg-indigo-500 rounded-full"></span>
        {props.children}
      </h3>
    ),
    p: ({ node, ...props }) => (
      <div className="mb-5 leading-7 text-slate-600 text-base sm:text-[1.05rem]" {...props} />
    ),
    ul: (props) => (
      <ul className="mb-6 space-y-2 text-slate-600" {...props} />
    ),
    ol: (props) => (
      <ol className="pl-6 mb-6 space-y-2 list-decimal text-slate-600 marker:font-semibold marker:text-indigo-600" {...props} />
    ),
    li: ({ node, children, ...props }) => {
      if (node?.parent?.tagName === "ol") {
        return <li className="pl-2" {...props}>{children}</li>;
      }
      return (
        <li className="flex gap-2.5 items-start" {...props}>
          <ChevronRight size={16} className="mt-1 text-indigo-500 shrink-0" />
          <span>{children}</span>
        </li>
      );
    },
    strong: (props) => (
      <strong className="font-semibold text-slate-900" {...props} />
    ),
    img: (props) => (
      <img className="h-auto max-w-full mx-auto my-8 border shadow-lg rounded-xl border-slate-100" {...props} />
    ),
    blockquote: (props) => (
      <blockquote className="relative py-4 pl-8 pr-4 my-8 border-l-4 border-indigo-500 rounded-r-lg bg-slate-50/50">
        <Quote className="absolute w-4 h-4 text-indigo-200 top-3 left-2 -z-10" />
        <div className="relative z-10 italic font-medium leading-relaxed text-slate-700">
          {props.children}
        </div>
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-slate-200" />,

    // --------------------------------------------
    // ENHANCED TABLE COMPONENTS
    // --------------------------------------------
    table: (props) => (
      <div className="my-8 -mx-2 overflow-x-auto sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
            <table className="min-w-full text-sm table-auto" {...props} />
          </div>
        </div>
      </div>
    ),
    thead: (props) => (
      <thead
        className="text-xs font-semibold tracking-wide uppercase border-b bg-slate-50 border-slate-200 text-slate-500"
        {...props}
      />
    ),
    tbody: (props) => (
      <tbody className="divide-y divide-slate-100/80" {...props} />
    ),
    tr: (props) => (
      <tr className="transition-colors even:bg-slate-50/50 hover:bg-slate-50" {...props} />
    ),
    th: ({ children, ...props }) => (
      <th
        className="sticky top-0 z-10 px-4 py-3 text-left align-middle whitespace-nowrap bg-slate-50/95 backdrop-blur-sm"
        scope="col"
        {...props}
      >
        <span className="text-[0.7rem] font-semibold tracking-wide text-slate-500">
          {children}
        </span>
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="px-4 py-3 text-sm align-top text-slate-700 whitespace-nowrap"
        {...props}
      >
        <span className="block">
          {children}
        </span>
      </td>
    ),
    // --------------------------------------------
    // END ENHANCED TABLE COMPONENTS
    // --------------------------------------------


    // --------------------------------------------
    // IMPROVED LINK COMPONENT
    // --------------------------------------------
    a: (props) => {
      const isExternal = props.href && (props.href.startsWith("http") || props.href.startsWith("//"));
      const target = isExternal ? "_blank" : undefined;
      const rel = isExternal ? "noopener noreferrer" : undefined;


      return (
        <a
          {...props}
          target={target}
          rel={rel}
          className="font-medium text-indigo-600 underline transition-colors hover:text-indigo-800 underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500"
        >
          {props.children}
          {isExternal && <ExternalLink size={12} className="inline-block ml-0.5 mb-0.5" />}
        </a>
      );
    },
    // --------------------------------------------
    // END IMPROVED LINK COMPONENT
    // --------------------------------------------
    
    code: CodeBlock,


    math: ({ value }) => renderBlockMath(value),
    inlineMath: ({ value }) => (
      <Suspense fallback={<span className="text-gray-400">...</span>}>
        <InlineMath className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[0.9em] mx-0.5" math={value} />
      </Suspense>
    ),  
  }), [renderBlockMath]);


  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeSanitize, { schema: extendedSanitizeSchema }],
        rehypeKatex,
        [rehypeHighlight, { detect: true }],
      ]}
      components={components}
    >
      {text || ""}
    </ReactMarkdown>
  );
});


export default MarkdownRenderer;






// // components/MarkdownRenderer.jsx
// "use client";

// import React, { memo, useCallback, useRef, useMemo, Suspense, lazy, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { Check, Copy, Calculator, Quote, ExternalLink, Terminal, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import rehypeHighlight from "rehype-highlight";
// import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// import "katex/dist/katex.min.css";
// import "highlight.js/styles/github-dark.css";

// // Lazy load heavy math rendering
// const BlockMath = lazy(() => import("react-katex").then(mod => ({ default: mod.BlockMath })));
// const InlineMath = lazy(() => import("react-katex").then(mod => ({ default: mod.InlineMath })));

// // --------------------------------------------
// // SANITIZATION EXTENSION
// // --------------------------------------------
// const extendedSanitizeSchema = {
//   ...defaultSchema,
//   attributes: {
//     ...(defaultSchema.attributes || {}),
//     code: [
//       ...(defaultSchema.attributes?.code || []),
//       ["className", /^language-.*$/],
//       ["className", "math-inline", "math-display"],
//     ],
//     span: [
//       ...(defaultSchema.attributes?.span || []),
//       ["className", "katex", "katex-display", "katex-html"],
//       ["title"],
//     ],
//   },
// };

// // --------------------------------------------
// // FORMULA META DATA
// // --------------------------------------------
// const FORMULA_INTELLIGENCE = {
//   sharpe: {
//     explain: "Measures excess return per unit of risk taken.",
//     use: "Compare portfolios with different risk levels.",
//     mistake: "Avoid comparing Sharpe ratios across non-comparable assets.",
//     level: "Intermediate",
//   },
//   volatility: {
//     explain: "Measures the fluctuation of returns around the mean.",
//     use: "Understand risk and price instability.",
//     mistake: "Higher volatility doesn't always mean worse investment.",
//     level: "Beginner",
//   },
// };

// // Detect formula type
// const detectFormulaType = (formula) => {
//   if (/Sharpe|R_p.*R_f/.test(formula)) return "sharpe";
//   if (/σ|variance/.test(formula)) return "volatility";
//   return "generic";
// };

// // --------------------------------------------
// // COMPONENTS
// // --------------------------------------------

// const CopyButton = ({ text, className = "" }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${className}`}
//     >
//       {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
//       {copied ? "Copied!" : "Copy"}
//     </button>
//   );
// };

// const MathBlock = ({ value, index }) => {
//   const type = detectFormulaType(value);
//   const meta = FORMULA_INTELLIGENCE[type];

//   return (
//     <div className="my-6 sm:my-8 bg-slate-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all duration-300">
//       <div className="flex justify-between items-center px-4 py-2 bg-white/50 border-b border-indigo-50">
//         <div className="flex items-center gap-2">
//           <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
//             <Calculator size={14} />
//           </div>
//           <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
//             Financial Model #{index}
//           </span>
//         </div>
//         <CopyButton text={value} className="text-slate-400 hover:text-indigo-600" />
//       </div>
      
//       <div className="p-6 overflow-x-auto bg-white">
//         <Suspense fallback={<div className="text-center text-slate-400 text-sm py-2">Rendering formula...</div>}>
//           <BlockMath math={value} errorColor="#ef4444" />
//         </Suspense>
//       </div>

//       {meta && (
//         <div className="px-5 py-4 bg-indigo-50/30 border-t border-indigo-50 text-sm text-slate-600 space-y-2">
//           <div className="flex gap-2 items-start">
//             <span className="font-semibold text-indigo-700 shrink-0 text-xs uppercase tracking-wide mt-0.5">Explanation</span>
//             <span className="leading-relaxed">{meta.explain}</span>
//           </div>
//           <div className="flex gap-2 items-start">
//             <span className="font-semibold text-indigo-700 shrink-0 text-xs uppercase tracking-wide mt-0.5">Usage</span>
//             <span className="leading-relaxed">{meta.use}</span>
//           </div>
//           <div className="flex gap-2 items-start">
//             <span className="font-semibold text-amber-600 shrink-0 text-xs uppercase tracking-wide mt-0.5">Note</span>
//             <span className="leading-relaxed">{meta.mistake}</span>
//           </div>
//           <div className="mt-2 pt-2">
//             <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full uppercase tracking-wider">
//               {meta.level}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CodeBlock = ({ node, inline, className, children, ...props }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const match = /language-(\w+)/.exec(className || "");

//   if (inline || !match) {
//     return (
//       <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-pink-600 font-mono text-[0.9em] border border-slate-200" {...props}>
//         {children}
//       </code>
//     );
//   }

//   return (
//     <div className="my-6 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg border border-slate-800 group">
//       <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-slate-700/50">
//         <div className="flex items-center gap-3">
//           <div className="flex gap-1.5">
//             <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
//             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
//             <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
//           </div>
//           <span className="text-xs font-medium text-slate-400 select-none flex items-center gap-1">
//             <Terminal size={10} /> {match[1]}
//           </span>
//         </div>
//         <div className="flex items-center gap-3">
//           <CopyButton text={String(children).replace(/\n$/, "")} className="text-slate-400 hover:text-white" />
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
//             aria-label={isCollapsed ? "Expand code" : "Collapse code"}
//             title={isCollapsed ? "Expand" : "Collapse"}
//           >
//             {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
//           </button>
//         </div>
//       </div>
//       {!isCollapsed && (
//         <div className="p-4 overflow-x-auto">
//           <code className={`${className} bg-transparent p-0 text-sm font-mono leading-relaxed`} {...props}>
//             {children}
//           </code>
//         </div>
//       )}
//     </div>
//   );
// };

// const MarkdownRenderer = memo(({ text }) => {
//   const equationCounter = useRef(0);
//   // Reset counter when text changes to ensure consistent numbering for the same content
//   useMemo(() => { equationCounter.current = 0; }, [text]);

//   const renderBlockMath = useCallback((value) => {
//     equationCounter.current += 1;
//     return <MathBlock value={value} index={equationCounter.current} />;
//   }, []);

//   const components = useMemo(() => ({
//     h1: (props) => (
//       <h1 className="text-3xl sm:text-4xl font-extrabold mt-12 mb-6 text-slate-900 tracking-tight border-b border-slate-100 pb-4" {...props} />
//     ),
//     h2: (props) => (
//       <h2 className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-slate-800" {...props} />
//     ),
//     h3: (props) => (
//       <h3 className="text-xl sm:text-2xl font-semibold mt-8 mb-3 text-slate-800 flex items-center gap-2" {...props}>
//         <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
//         {props.children}
//       </h3>
//     ),
//     p: ({ node, ...props }) => (
//       <div className="mb-5 leading-relaxed text-slate-700 text-base sm:text-lg" {...props} />
//     ),
//     ul: (props) => (
//       <ul className="mb-6 space-y-3 text-slate-700" {...props} />
//     ),
//     ol: (props) => (
//       <ol className="mb-6 pl-6 list-decimal space-y-3 text-slate-700 marker:font-bold marker:text-indigo-600" {...props} />
//     ),
//     li: ({ node, children, ...props }) => {
//       if (node?.parent?.tagName === "ol") {
//         return <li className="pl-2" {...props}>{children}</li>;
//       }
//       return (
//         <li className="flex gap-2 items-start" {...props}>
//           <ChevronRight size={16} className="mt-1 sm:mt-1.5 text-indigo-500 shrink-0" />
//           <span>{children}</span>
//         </li>
//       );
//     },
//     strong: (props) => (
//       <strong className="font-bold text-slate-900" {...props} />
//     ),
//     img: (props) => (
//       <img className="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto" {...props} />
//     ),
//     blockquote: (props) => (
//       <blockquote className="my-8 relative pl-10 pr-4 py-4 bg-slate-50 rounded-r-xl border-l-4 border-indigo-500 shadow-sm">
//         <Quote className="absolute top-2 left-2 text-indigo-200 w-6 h-6 -z-10 opacity-50" />
//         <div className="italic text-slate-700 relative z-10">
//           {props.children}
//         </div>
//       </blockquote>
//     ),
//     hr: () => <hr className="my-10 border-slate-200" />,
//     table: (props) => (
//       <div className="my-8 overflow-x-auto rounded-xl border border-slate-200/75 bg-white shadow-sm">
//         <table className="min-w-full" {...props} />
//       </div>
//     ),
//     thead: (props) => <thead className="bg-slate-50" {...props} />,
//     tbody: (props) => <tbody className="divide-y divide-slate-200/75" {...props} />,
//     tr: (props) => <tr className="even:bg-slate-50 transition-colors hover:bg-slate-100" {...props} />,
//     th: ({ children, ...props }) => (
//       <th className="px-4 py-3.5 sm:px-6 text-left text-sm font-semibold text-slate-800" {...props}>
//         {children}
//       </th>
//     ),
//     td: ({ children, ...props }) => (
//       <td className="px-4 py-3.5 sm:px-6 text-sm text-slate-700" {...props}>
//         {children}
//       </td>
//     ),

//     // --------------------------------------------
//     // IMPROVED LINK COMPONENT
//     // --------------------------------------------
//     a: (props) => {
//       const isExternal = props.href && (props.href.startsWith("http") || props.href.startsWith("//"));
//       const target = isExternal ? "_blank" : undefined;
//       const rel = isExternal ? "noopener noreferrer" : undefined;

//       return (
//         <a
//           {...props}
//           target={target}
//           rel={rel}
//           className="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 font-medium underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-500 wrap-break-words"
//         >
//           {props.children}
//           {isExternal && <ExternalLink size={12} className="inline-block ml-0.5 mb-0.5" />}
//         </a>
//       );
//     },
//     // --------------------------------------------
//     // END IMPROVED LINK COMPONENT
//     // --------------------------------------------
    
//     code: CodeBlock,

//     math: ({ value }) => renderBlockMath(value),
//     inlineMath: ({ value }) => (
//       <Suspense fallback={<span className="text-gray-400">...</span>}>
//         <InlineMath className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50/50 text-indigo-900 font-semibold mx-1" math={value} />
//       </Suspense>
//     ),  
//   }), [renderBlockMath]);

//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm, remarkMath]}
//       rehypePlugins={[
//         [rehypeSanitize, { schema: extendedSanitizeSchema }],
//         rehypeKatex,
//         [rehypeHighlight, { detect: true }],
//       ]}
//       components={components}
//     >
//       {text || ""}
//     </ReactMarkdown>
//   );
// });

// export default MarkdownRenderer;














// old version









