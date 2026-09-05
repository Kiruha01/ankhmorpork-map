export type ObjectInspectorMotion = {
  durationMs: number
  cssEasing: string
  easing: (progress: number) => number
}

const CONTROL_POINTS = { x1: 0.33, y1: 1, x2: 0.68, y2: 1 }

function cubicBezier(value: number, firstControlPoint: number, secondControlPoint: number): number {
  const inverse = 1 - value
  return (3 * inverse * inverse * value * firstControlPoint)
    + (3 * inverse * value * value * secondControlPoint)
    + (value * value * value)
}

/** Equivalent to CSS `cubic-bezier(0.33, 1, 0.68, 1)`. */
export function objectInspectorEasing(progress: number): number {
  const target = Math.min(1, Math.max(0, progress))
  let low = 0
  let high = 1

  for (let step = 0; step < 20; step += 1) {
    const time = (low + high) / 2
    if (cubicBezier(time, CONTROL_POINTS.x1, CONTROL_POINTS.x2) < target) low = time
    else high = time
  }

  return cubicBezier((low + high) / 2, CONTROL_POINTS.y1, CONTROL_POINTS.y2)
}

export const OBJECT_INSPECTOR_MOTION: ObjectInspectorMotion = {
  durationMs: 400,
  cssEasing: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easing: objectInspectorEasing,
}
