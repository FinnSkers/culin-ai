import { cn } from "@/lib/utils";

export function ChefRatAvatar({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-10 w-10 shrink-0", className)}
      {...props}
    >
      <g>
        {/* Hat */}
        <path fill="#FFFFFF" d="M50,10 C65,10 70,20 70,25 C70,30 65,35 50,35 C35,35 30,30 30,25 C30,20 35,10 50,10 Z" />
        <path fill="#E0E0E0" d="M30 25 C30 30 35 35 50 35 L 50 32 C 37 32 33 29 33 25 Z" />
        <path fill="#FFFFFF" d="M25,35 H75 V40 H25 Z" />
        <path fill="#E0E0E0" d="M25 38 H75 V40 H25 Z" />

        {/* Head */}
        <path d="M50,38 C35,38 30,50 30,55 C30,65 40,75 50,75 C60,75 70,65 70,55 C70,50 65,38 50,38 Z" fill="#9E9E9E" />
        
        {/* Ears */}
        <circle cx="35" cy="40" r="8" fill="#BDBDBD" />
        <circle cx="65" cy="40" r="8" fill="#BDBDBD" />
        <circle cx="35" cy="40" r="5" fill="#F48FB1" />
        <circle cx="65" cy="40" r="5" fill="#F48FB1" />

        {/* Eyes */}
        <circle cx="43" cy="52" r="3" fill="#000000" />
        <circle cx="57" cy="52" r="3" fill="#000000" />
        <circle cx="44" cy="51" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="51" r="1" fill="#FFFFFF" />
        
        {/* Nose and Whiskers */}
        <path d="M48,62 C48,60 52,60 52,62 C52,64 48,64 48,62 Z" fill="#F48FB1"/>
        <path d="M45,63 L35,60" stroke="#757575" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M45,63 L38,65" stroke="#757575" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M55,63 L65,60" stroke="#757575" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M55,63 L62,65" stroke="#757575" strokeWidth="0.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
