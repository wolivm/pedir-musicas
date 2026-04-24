export function FloralWreath({ size = 140, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* folhagem base */}
      <g fill="none" stroke="#7E8E6E" strokeWidth="1.5" strokeLinecap="round">
        <path d="M100 18 C 50 22, 18 60, 22 110 C 28 160, 70 184, 100 182" opacity="0.7" />
        <path d="M100 18 C 150 22, 182 60, 178 110 C 172 160, 130 184, 100 182" opacity="0.7" />
      </g>
      {/* folhinhas */}
      <g fill="#AFBBA0" opacity="0.9">
        <ellipse cx="30" cy="70" rx="8" ry="3" transform="rotate(-30 30 70)" />
        <ellipse cx="40" cy="130" rx="9" ry="3" transform="rotate(30 40 130)" />
        <ellipse cx="160" cy="70" rx="8" ry="3" transform="rotate(30 160 70)" />
        <ellipse cx="160" cy="130" rx="9" ry="3" transform="rotate(-30 160 130)" />
        <ellipse cx="80" cy="30" rx="7" ry="2.5" transform="rotate(20 80 30)" />
        <ellipse cx="120" cy="30" rx="7" ry="2.5" transform="rotate(-20 120 30)" />
        <ellipse cx="70" cy="175" rx="8" ry="3" transform="rotate(-20 70 175)" />
        <ellipse cx="130" cy="175" rx="8" ry="3" transform="rotate(20 130 175)" />
      </g>
      {/* rosas */}
      <g>
        <circle cx="35" cy="100" r="9" fill="#D4828C" />
        <circle cx="35" cy="100" r="5" fill="#F4D8DA" />
        <circle cx="165" cy="100" r="9" fill="#D4828C" />
        <circle cx="165" cy="100" r="5" fill="#F4D8DA" />
        <circle cx="100" cy="22" r="7" fill="#E9A7AE" />
        <circle cx="100" cy="22" r="3.5" fill="#F4D8DA" />
        <circle cx="100" cy="178" r="8" fill="#E9A7AE" />
        <circle cx="100" cy="178" r="4" fill="#F4D8DA" />
      </g>
      {/* florzinhas amarelas */}
      <g fill="#E9C46A" opacity="0.85">
        <circle cx="55" cy="55" r="3" />
        <circle cx="145" cy="55" r="3" />
        <circle cx="55" cy="145" r="3" />
        <circle cx="145" cy="145" r="3" />
      </g>
      {/* pequenas lilás */}
      <g fill="#B7A9D9" opacity="0.8">
        <circle cx="28" cy="125" r="2.5" />
        <circle cx="172" cy="75" r="2.5" />
        <circle cx="75" cy="22" r="2.5" />
        <circle cx="125" cy="180" r="2.5" />
      </g>
    </svg>
  );
}
