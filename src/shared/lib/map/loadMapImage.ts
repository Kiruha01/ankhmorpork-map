import type maplibregl from 'maplibre-gl'

/** Decode SVG with the browser before MapLibre copies it into its image atlas. */
export async function loadMapImage(
  map: maplibregl.Map,
  url: string,
  rasterSize?: { width: number; height: number },
  halo?: { color: string; width: number },
): Promise<HTMLImageElement | ImageBitmap | ImageData> {
  if (!/\.svg(?:[?#]|$)/i.test(url)) {
    const image = (await map.loadImage(url)).data
    return halo ? addImageHalo(image, halo) : image
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  await image.decode()
  // MapLibre draws the SVG onto a canvas using these dimensions. Rasterizing at
  // the target density avoids shrinking a large texture with GPU filtering.
  if (rasterSize) {
    image.width = rasterSize.width
    image.height = rasterSize.height
  }
  return halo ? addImageHalo(image, halo) : image
}

function addImageHalo(
  image: HTMLImageElement | ImageBitmap,
  halo: { color: string; width: number },
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create map icon canvas')

  // Expand the alpha silhouette, tint it, then restore the original icon above it.
  for (let step = 0; step < 32; step++) {
    const angle = step * Math.PI / 16
    context.drawImage(image, Math.cos(angle) * halo.width, Math.sin(angle) * halo.width, image.width, image.height)
  }
  context.globalCompositeOperation = 'source-in'
  context.fillStyle = halo.color
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.globalCompositeOperation = 'source-over'
  context.drawImage(image, 0, 0, image.width, image.height)
  return context.getImageData(0, 0, canvas.width, canvas.height)
}
