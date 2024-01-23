import { getChartData } from "./data/data"
import { chart } from "./chart"
import './styles'

const tgChart = chart(document.getElementById("chart"), getChartData())
tgChart.init()