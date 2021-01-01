import { IPoint, IRect, Row } from "./types"

class MapRenderer {
	private data: any[]

	private maxRect: IRect = { x: 0, y: 0, w: 0, h: 0 }
	private viewRect: IRect = { x: 0, y: 0, w: 0, h: 0 }

	private isMouseDown = false
	private mouseDownPoint: IPoint = { x: 0, y: 0 }

	private overlay?: HTMLDivElement

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
		const minLong = longs.reduce(function (a, b) { return a < b ? a : b })
		const maxLong = longs.reduce(function (a, b) { return a > b ? a : b })
		const longSpan = maxLong - minLong

		const lats = this.data.map(o => o.lat)
		const minLat = lats.reduce(function (a, b) { return a < b ? a : b })
		const maxLat = lats.reduce(function (a, b) { return a > b ? a : b })
		const latSpan = maxLat - minLat

		this.maxRect = { x: minLong, y: minLat, w: longSpan, h: latSpan }
		this.viewRect = { ...this.maxRect }

		canvas.onmousedown = (e: MouseEvent) => {
			let rect = (e.target as HTMLElement).getBoundingClientRect()
			let x = e.clientX - rect.left
			let y = e.clientY - rect.top
			this.mouseDownPoint = { x, y }

			this.isMouseDown = true
		}

		canvas.onmousemove = (e: MouseEvent) => {
			if (!this.isMouseDown) {
				return
			}

			if (!e.buttons) {
				// Mouse button was released
				this.isMouseDown = false
				if (this.overlay) {
					this.overlay.remove()
					this.overlay = undefined
				}
				return
			}

			let rect = (e.target as HTMLElement).getBoundingClientRect()
			let x = e.clientX - rect.left
			let y = e.clientY - rect.top
			const p = { x, y }

			this.showOverlay({
				x: this.mouseDownPoint.x,
				y: this.mouseDownPoint.y,
				w: p.x - this.mouseDownPoint.x,
				h: p.y - this.mouseDownPoint.y })
		}

		canvas.onmouseup = (e: MouseEvent) => {
			let rect = (e.target as HTMLElement).getBoundingClientRect()
			let x = e.clientX - rect.left
			let y = e.clientY - rect.top
			const p = { x, y }

			if (p.x <= this.mouseDownPoint.x || p.y <= this.mouseDownPoint.y) {
				// Zoom all
				this.viewRect = { ...this.maxRect }
			} else {
				const left = this.viewRect.x + (this.mouseDownPoint.x / rect.width) * this.viewRect.w
				const top = this.viewRect.y + (this.mouseDownPoint.y / rect.height) * this.viewRect.h
				const right = this.viewRect.x + (p.x / rect.width) * this.viewRect.w
				const bottom = this.viewRect.y + (p.y / rect.height) * this.viewRect.h

				this.viewRect = { x: left, y: top, w: right-left, h: bottom-top }
			}

			this.draw()

			this.isMouseDown = false
			if (this.overlay) {
				this.overlay.remove()
				this.overlay = undefined
			}
		}
	}

	showOverlay(rect: IRect) {
		if (!this.overlay) {
			this.overlay = document.createElement('div')
			this.overlay.style.position = 'absolute'
			this.overlay.style.backgroundColor = 'rgba(0, 128, 192, 0.2)'
			this.overlay.style.zIndex = '10'
			this.overlay.style.pointerEvents = 'none'
			this.canvas.parentElement!.appendChild(this.overlay)
		}

		this.overlay.style.left = `${rect.x}px`
		this.overlay.style.top = `${rect.y}px`
		this.overlay.style.width = `${rect.w}px`
		this.overlay.style.height = `${rect.h}px`
	}

	draw() {
		const { canvas, data, viewRect } = this

		const ctx = canvas.getContext('2d')!

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		const width = canvas.width
		const height = canvas.height

		ctx.fillStyle = "rgba(0, 128, 192, 0.35)"
		data.forEach(o => {
			const x = (o.long - viewRect.x) * width / viewRect.w
			const y = (o.lat - viewRect.y) * height / viewRect.h
			const size = 3

			ctx.beginPath()
			ctx.arc(x, y, size, 0, 2 * Math.PI)
			ctx.fill()
		})
	}

}

export { MapRenderer }
