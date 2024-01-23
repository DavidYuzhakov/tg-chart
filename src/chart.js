import { tooltip } from './components/tooltip'
import {
  css,
  isOver,
  toDate,
  circle,
  line,
  boundaries,
  toCoords,
  computeYRatio,
  computeXRatio,
  clear,
} from './utils'
import { sliderChart } from './slider'
import { checkbox } from './components/checkbox'

const WIDTH = 600
const HEIGHT = 200
const PADDING = 40
const DPI_WIDTH = WIDTH * 2
const DPI_HEIGHT = HEIGHT * 2
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
const VIEW_WIDTH = DPI_WIDTH
const ROWS_COUNT = 5
const SPEED = 80

export function chart(root, data) {
  const canvas = root.querySelector('[data-el="main"]')
  const tip = tooltip(root.querySelector('[data-el="tooltip"]'))
  const slider = sliderChart(
    root.querySelector('[data-el="slider"]'),
    data,
    DPI_WIDTH
  )
  const ctx = canvas.getContext('2d')
  let raf
  let prevMax
  canvas.width = DPI_WIDTH
  canvas.height = DPI_HEIGHT
  css(canvas, {
    width: WIDTH + 'px',
    height: HEIGHT + 'px',
  })

  const proxy = new Proxy(
    {},
    {
      set(...args) {
        const result = Reflect.set(...args)
        raf = requestAnimationFrame(paint)
        return result
      },
    }
  )

  slider.subscribe((pos) => {
    proxy.pos = pos
  })

  canvas.addEventListener('mousemove', mousemove)
  canvas.addEventListener('mouseleave', mouseleave)

  function mousemove({ clientX, clientY }) {
    const { left, top } = canvas.getBoundingClientRect()
    proxy.mouse = {
      x: (clientX - left) * 2,
      tooltip: {
        left: clientX - left,
        top: clientY - top,
      },
    }
  }

  function mouseleave() {
    proxy.mouse = null
    tip.hide()
  }

  function getMax(yMax) {
    const step = (yMax - prevMax) / SPEED

    if (proxy.max < yMax) {
      proxy.max += step
    } else if (proxy.max > yMax) {
      proxy.max = yMax
      prevMax = yMax
    }

    return proxy.max
  }

  function btnTheme(el) {
    const btn = document.querySelector('.theme')
    const mode = localStorage.getItem('mode')
    const isNight = mode === 'night'
    const type = isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'

    const update = (isEnable) => {
      el.classList.toggle('dark', isEnable)
      localStorage.setItem('mode', isEnable ? 'night' : 'day')
    }
      
    const toggle = () => {
      isNight ? update(false) : update(true)
    }

    update(isNight)
    btn.onclick = () => {
      toggle()
      proxy.type = type
    }
  
    btn.textContent = type
  }

  function paint() {
    clear(ctx, DPI_WIDTH, DPI_HEIGHT)

    const length = data.columns[0].length
    const leftIndex = Math.round((length * proxy.pos[0]) / 100)
    const rightIndex = Math.round((length * proxy.pos[1]) / 100)
    
    const columns = data.columns.map((col) => {
      if (typeof col.visible !== 'boolean') {
        col.visible = true
      }

      if (col.visible) {
        const res = col.slice(leftIndex, rightIndex)
        if (typeof res[0] !== 'string') {
          res.unshift(col[0])
        }
        return res
      }

      return false
    })

    const [yMin, yMax] = boundaries({ columns, types: data.types })
    if (!prevMax) {
      prevMax = yMax
      proxy.max = yMax
    }

    const max = getMax(yMax)

    const yRatio = computeYRatio(VIEW_HEIGHT, max, yMin)
    const xRatio = computeXRatio(VIEW_WIDTH, columns[0].length)

    const yData = columns.filter((col) => data.types[col[0]] === 'line')
    const xData = columns.filter((col) => data.types[col[0]] !== 'line')[0]

    yAxis(yMin, max)
    xAxis(xData, yData, xRatio)

    yData
      .map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin))
      .forEach((coords, idx) => {
        const color = data.colors[yData[idx][0]]
        line(ctx, coords, { color })

        for (const [x, y] of coords) {
          if (isOver(proxy.mouse, x, coords.length + 1, DPI_WIDTH)) {
            circle(ctx, [x, y], color)
            break
          }
        }
      })
    
    btnTheme(root.parentElement)
  }

  function xAxis(xData, yData, xRatio) {
    const colsCount = 6
    const step = Math.round(xData.length / colsCount) // растояние между lables
    ctx.beginPath()

    for (let i = 1; i < xData.length; i++) {
      const x = i * xRatio

      // деление без остатка
      if ((i - 1) % step === 0) {
        const text = toDate(xData[i])
        ctx.fillText(text.toString(), x, DPI_HEIGHT - 10)
      }

      if (isOver(proxy.mouse, x, xData.length, DPI_WIDTH)) {
        ctx.save()
        ctx.moveTo(x, PADDING / 2)
        ctx.lineTo(x, DPI_HEIGHT - PADDING)
        ctx.restore()

        tip.show(proxy.mouse.tooltip, {
          title: toDate(xData[i], true),
          items: yData.map((col) => ({
            color: data.colors[col[0]],
            name: data.names[col[0]],
            value: col[i + 1],
          })),
        })
      }
    }
    ctx.stroke()
    ctx.closePath()

    return
  }

  function yAxis(yMin, yMax) {
    const step = VIEW_HEIGHT / ROWS_COUNT
    const textStep = (yMax - yMin) / ROWS_COUNT

    ctx.beginPath()
    ctx.lineWidth = .5
    ctx.strokeStyle = '#bbb'
    ctx.font = 'normal 20px Helvetica,sans-serif'
    ctx.fillStyle = '#96a2aa'
    for (let i = 1; i <= ROWS_COUNT; i++) {
      const y = step * i
      const text = Math.round(yMax - textStep * i)
      ctx.fillText(text.toString(), 5, y + PADDING - 10)
      ctx.moveTo(0, y + PADDING)
      ctx.lineTo(DPI_WIDTH, y + PADDING)
    }
    ctx.stroke()
    ctx.closePath()
  }

  return {
    init() {
      paint()
      checkbox(data)
    },
    destroy() {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', mousemove)
      canvas.removeEventListener('mouseleave', mouseleave)
    },
  }
}
