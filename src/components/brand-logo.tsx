import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image className={`brand-logo ${className}`} src="/images/diyor-burger-logo.png" alt="DIYOR BURGER" width={2160} height={728} priority />;
}
