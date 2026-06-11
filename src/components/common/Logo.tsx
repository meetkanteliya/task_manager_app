import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ className, textClassName, size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8 text-sm rounded-lg",
    md: "h-10 w-10 text-base rounded-xl",
    lg: "h-14 w-14 text-2xl rounded-2xl",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center font-black bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 text-white select-none leading-none",
          iconSizes[size]
        )}
      >
        <span className="font-serif">T</span>
        <span className="font-mono -ml-0.5">F</span>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-slate-900 dark:text-white", textSizes[size], textClassName)}>
          Task<span className="text-blue-600 dark:text-blue-400">Flow</span>
        </span>
      )}
    </div>
  );
}
