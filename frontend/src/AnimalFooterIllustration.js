import React from "react";

const AnimalFooterIllustration = () => (
  <div className="animal-footer-illustration">
    {/* Animated dog */}
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
      <ellipse cx="40" cy="75" rx="35" ry="10" fill="#ffe5b4" />
      <ellipse cx="40" cy="60" rx="25" ry="20" fill="#ffb77c" />
      <ellipse cx="30" cy="55" rx="7" ry="8" fill="#fff3e0" />
      <ellipse cx="50" cy="55" rx="7" ry="8" fill="#fff3e0" />
      <ellipse cx="40" cy="65" rx="10" ry="7" fill="#fff" />
      <ellipse cx="36" cy="63" rx="2" ry="3" fill="#222" />
      <ellipse cx="44" cy="63" rx="2" ry="3" fill="#222" />
      <ellipse cx="40" cy="70" rx="3" ry="2" fill="#222" />
      {/* Ears */}
      <ellipse cx="20" cy="50" rx="5" ry="10" fill="#ff9800">
        <animate attributeName="cy" values="50;53;50" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="60" cy="50" rx="5" ry="10" fill="#ff9800">
        <animate attributeName="cy" values="50;53;50" dur="2s" repeatCount="indefinite" />
      </ellipse>
    </svg>
    {/* Animated cat */}
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
      <ellipse cx="60" cy="75" rx="30" ry="10" fill="#ffe5b4" />
      <ellipse cx="60" cy="60" rx="20" ry="20" fill="#ffb77c" />
      {/* Face */}
      <ellipse cx="60" cy="65" rx="10" ry="7" fill="#fff" />
      <ellipse cx="56" cy="63" rx="2" ry="3" fill="#222" />
      <ellipse cx="64" cy="63" rx="2" ry="3" fill="#222" />
      <ellipse cx="60" cy="70" rx="3" ry="2" fill="#222" />
      {/* Ears */}
      <polygon points="50,50 55,60 60,55" fill="#ff9800">
        <animate attributeName="points" values="50,50 55,60 60,55;50,48 55,60 60,55;50,50 55,60 60,55" dur="2s" repeatCount="indefinite" />
      </polygon>
      <polygon points="70,50 65,60 60,55" fill="#ff9800">
        <animate attributeName="points" values="70,50 65,60 60,55;70,48 65,60 60,55;70,50 65,60 60,55" dur="2s" repeatCount="indefinite" />
      </polygon>
      {/* Tail */}
      <path d="M80,70 Q95,80 80,85" stroke="#ff9800" strokeWidth="4" fill="none">
        <animate attributeName="d" values="M80,70 Q95,80 80,85;M80,70 Q100,75 80,85;M80,70 Q95,80 80,85" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  </div>
);

export default AnimalFooterIllustration; 