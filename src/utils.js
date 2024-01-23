export function computeYRatio (height, max, min) {
  return (max - min) / height
}
export function computeXRatio (width, length) {
  return width / (length - 2)
}

export function boundaries({ columns, types }) {
  let min
  let max

  columns.forEach((col) => {
    if (types[col[0]] !== "line") {
      return
    }
    if (typeof min !== "number") min = col[1]
    if (typeof max !== "number") max = col[1]

    if (min > col[1]) min = col[1]
    if (max < col[1]) max = col[1]

    for (let i = 2; i < col.length; i++) {
      if (max < col[i]) max = col[i]
      if (min > col[i]) min = col[i]
    }
  })

  return [min, max]
}


export function toDate(timestamp, tooltip = false) {
  const shortMonth = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec,",
  ]
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const date = new Date(timestamp)
  return `${shortMonth[date.getMonth()]} ${date.getDate()}${tooltip ? `, ${shortDays[date.getDay()]}` : ''}`
}

export function isOver(mouse, x, length, dWidth) {
  if (!mouse) return false
  const width = dWidth / (length - 2) // 10.6 |<->|
  return Math.abs(x - mouse.x) < width / 2
}

export function line(ctx, coords, { color }, width = 4) {
  ctx.beginPath()
  ctx.save()
  ctx.lineWidth = width
  ctx.strokeStyle = color
  for (const [x, y] of coords) {
    ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
  ctx.closePath()
}

export function circle(ctx, [x, y], color) {
  const CIRCLE_RADIUS = 8

  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.fillStyle = '#fff'
  ctx.lineWidth = 3
  ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
  ctx.fill
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}

export function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function css (el, styles = {}) {
  Object.assign(el.style, styles)
}

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin) {
  return (col) =>
    col
      .map((y, i) => [
        Math.floor((i - 1) * xRatio), // x
        Math.floor(DPI_HEIGHT - PADDING - (y - yMin) / yRatio), //y
      ])
      .filter((_, i) => i !== 0)
}