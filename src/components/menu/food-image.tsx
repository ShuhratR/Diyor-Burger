"use client";

import Image from "next/image";
import { useState } from "react";

export function FoodImage({ src, alt, compact=false }: { src?: string; alt:string; compact?:boolean }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <Image className="food-image" src={src} alt={alt} width={640} height={440} onError={() => setFailed(true)} /> : <div className={`food-placeholder ${compact?"compact":""}`} role="img" aria-label={alt}><span>DIYOR</span><b>BURGER</b></div>;
}
