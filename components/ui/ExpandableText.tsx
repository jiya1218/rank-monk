'use client';

import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxChars?: number;
  className?: string;
}

export function ExpandableText({ text, maxChars = 45, className = '' }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return <span>—</span>;
  if (text.length <= maxChars) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setExpanded(!expanded);
      }}
      title={expanded ? 'Click to collapse' : 'Click to view full sentence'}
      className={`cursor-pointer transition-all inline-block ${className}`}
    >
      {expanded ? (
        <span className="break-words">
          {text}
          <span className="text-[10px] text-[#8c6b2d] font-black underline ml-1.5 cursor-pointer">
            [collapse]
          </span>
        </span>
      ) : (
        <span className="break-words">
          {text.slice(0, maxChars)}...
          <span className="text-[10px] text-[#8c6b2d] font-black underline ml-1 cursor-pointer">
            [more]
          </span>
        </span>
      )}
    </span>
  );
}

export default ExpandableText;

