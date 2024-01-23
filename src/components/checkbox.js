const namesArr = ['Joined', 'Left']
export const names = (name) => namesArr[name.replace('#', '')]
  ? namesArr[name.replace('#', '')]
  : name

export function checkbox(data) {
  const dataLine = data.columns.filter((col) => data.types[col[0]] === 'line')

  const checkboxData = dataLine.map((col) => ({
    id: col[0],
    color: data.colors[col[0]],
    name: data.names[col[0]],
  }))

  const chart = document.getElementById('chart')
  checkboxData.map((item) =>
    chart.insertAdjacentHTML(
      'beforeend',
      `
      <div class="tg-chart-checkbox" id="${item.id}">
        <input type="checkbox" checked />
        <label>
          <span style="border-color: ${item.color}"></span>
          ${names(item.name)}
        </label>
      </div>
      `
    )
  )

  const checkboxes = document.querySelectorAll('.tg-chart-checkbox input')
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const lineId = e.target.parentElement.id
      const line = data.columns.find(col => col[0] === lineId)
      if (line) {
        const isChecked = e.target.checked
        if (isChecked) {
          line.visible = true
        } else {
          if (data.columns.filter(col => col.visible).length > 2) {
            line.visible = false

          } else {
            e.target.checked = true
          }
        }
      }
      const element = document.querySelector('[data-el="main"]')
      const event = new MouseEvent('mousemove')
      for (let i = 0; i < 3; i++) {
        element.dispatchEvent(event)
      }
    })
  })
}
