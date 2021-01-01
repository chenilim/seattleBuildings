import { Row } from "./types"

class MapRenderer {
	private minLong: number
	private longSpan: number
	private minLat: number
	private latSpan: number
	private data: any[]

	constructor(
		public canvas: HTMLCanvasElement,
		public items: Row[]
	) {
		canvas.width = 1600
		canvas.height = 1000
		canvas.style.width = '800px'
		canvas.style.height = '500px'

		this.data = items.map(o => ({
			lat: Number(o.lat),
			long: Number(o.long)
		})).filter(o => o.lat && o.long)

		const longs = this.data.map(o => o.long)
		this.minLong = longs.reduce(function (a, b) { return a < b ? a : b })
		const maxLong = longs.reduce(function (a, b) { return a > b ? a : b })
		this.longSpan = maxLong - this.minLong

		const lats = this.data.map(o => o.lat)
		this.minLat = lats.reduce(function (a, b) { return a < b ? a : b })
		const maxLat = lats.reduce(function (a, b) { return a > b ? a : b })
		this.latSpan = maxLat - this.minLat
	}

	draw() {
		const { canvas, data, minLong, longSpan, minLat, latSpan } = this
		const ctx = canvas.getContext('2d')!

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		const padding = 10
		const width = canvas.width - padding * 2
		const height = canvas.height - padding * 2

		ctx.fillStyle = "rgba(0, 128, 192, 0.35)"
		data.forEach(o => {
			const x = padding + (o.long - minLong) * width / longSpan
			const y = padding + (o.lat - minLat) * height / latSpan
			const size = 3

			ctx.beginPath()
			ctx.arc(x, y, size, 0, 2 * Math.PI)
			ctx.fill()
		})
	}

}

export { MapRenderer }
