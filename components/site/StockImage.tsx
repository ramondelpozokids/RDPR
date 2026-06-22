import Image from "next/image"
import { cn } from "@/lib/utils"
import { STOCK, stockUrl, type StockImageKey } from "@/lib/site/stock-images"

type StockImageProps = {
  name: StockImageKey
  width?: number
  className?: string
  imageClassName?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
}

export function StockImage({
  name,
  width = 1200,
  className,
  imageClassName,
  fill = true,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: StockImageProps) {
  const { alt } = STOCK[name]
  const src = stockUrl(name, width)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : Math.round(width * 0.67)}
        className={cn("object-cover object-center", imageClassName)}
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}
