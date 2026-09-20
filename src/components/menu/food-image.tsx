import Image from "next/image";
export function FoodImage({ src, alt, compact=false }: { src?: string; alt:string; compact?:boolean }) { return src ? <Image className="food-image" src={src} alt={alt} width={640} height={440} /> : <div className={`food-placeholder ${compact?"compact":""}`} role="img" aria-label={alt}><span>DIYOR</span><b>BURGER</b></div>; }
