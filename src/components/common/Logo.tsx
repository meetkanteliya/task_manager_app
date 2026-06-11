import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ className, textClassName, size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl font-extrabold",
    lg: "text-3xl font-black",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl bg-transparent select-none leading-none shrink-0",
          iconSizes[size]
        )}
      >
        <Image
          src="/logo.png"
          alt="TaskFlow Logo"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-slate-900 dark:text-white", textSizes[size], textClassName)}>
          Task<span className="text-blue-600 dark:text-blue-400">Flow</span>
        </span>
      )}
    </div>
  );
}
