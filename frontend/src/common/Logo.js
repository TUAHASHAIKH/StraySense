// src/components/common/Logo.js
import React from 'react';

const Logo = ({ width = 60, height = 60 }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 60 60" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Dog head shape */}
        <path 
          d="M30 10C17 10 10 20 10 32C10 44 17 50 30 50C43 50 50 44 50 32C50 20 43 10 30 10Z" 
          fill="#FF9248" 
        />
        
        {/* Ear */}
        <path 
          d="M15 25C12 18 13 12 16 8C19 12 18 18 15 25Z" 
          fill="#FF9248" 
        />
        
        {/* Dark patch */}
        <path 
          d="M35 35C28 42 20 40 20 35C20 30 28 28 35 35Z" 
          fill="#B86A30" 
        />
        
        {/* Eye */}
        <circle cx="22" cy="25" r="3" fill="#333" />
        
        {/* Nose */}
        <circle cx="15" cy="30" r="3" fill="#333" />
      </g>
    </svg>
  );
};

export default Logo;