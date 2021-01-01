import './main.css'
import * as Chart from 'chart.js'
import { Row } from './types'
import { MapRenderer } from './mapRenderer'

let allItems: Row[] = []
let chart: Chart


async function loadData(): Promise<void> {
	console.log(`LoadData...`)

	const url = './rows.json'
	// const url = './allrows.json'
	const response = await fetch(url)
	console.log(`Loading JSON...`)
	const rows = await response.json()

	allItems = rows

	// console.log(`Parsing JSON...`)
	// allItems = rows.data.map((r: any) => {
	// 	let link = ''
	// 	const info = r[28]
	// 	if (info?.length > 0) {
	// 		link = info[0]
	// 	}
	// 	return {
	// 		id: r[8],
	// 		permitSubClass: r[9],
	// 		permitClass: r[10],
	// 		permitType: r[11],
	// 		permitSubType: r[12],
	// 		description: r[13],
	// 		issued: r[19],
	// 		expires: r[20],
	// 		completed: r[21],
	// 		status: r[22],
	// 		address: r[23],
	// 		city: r[24],
	// 		state: r[25],
	// 		zip: r[26],
	// 		lat: r[29],
	// 		long: r[30],
	// 		link,
	// 	}
	// })

	console.log(`Loaded ${allItems.length} rows.`)
}

function group(items: any[], mapper: (_: any) => any) {
	let counts = new Map()
	for (const item of items) {
		const key = mapper(item)
		const count = counts.get(key)
		counts.set(key, count ? count + 1 : 1)
	}

	return counts
}

function createSelectOption(value: string, displayName: string) {
	const element = document.createElement('option')
	element.value = value
	element.innerText = displayName
	return element
}

function createControls() {
	const panel = document.getElementById('header') as HTMLDivElement

	const refresh = () => {
		drawChart(selectClass.value, selectType.value, selectStatus.value)
	}

	const selectClass = addSelector(group(allItems, o => o.permitClass), refresh)
	const selectType = addSelector(group(allItems, o => o.permitSubType), refresh)
	const selectStatus = addSelector(group(allItems, o => o.status), refresh)

	selectClass.value = 'Residential'
	selectType.value = 'New'
	selectStatus.value = 'Completed'

	// Download data
	// const downloadLink = document.createElement('a') as HTMLAnchorElement
	// downloadLink.href = '#'
	// downloadLink.innerText = 'Download data'
	// downloadLink.onclick = () => { downloadData() }
	// panel.appendChild(downloadLink)
}

function addSelector(group: Map<any, any>, refresh: () => any) {
	const panel = document.getElementById('header') as HTMLDivElement

	const selector = panel.appendChild(document.createElement('select'))
	selector.appendChild(createSelectOption('', 'All'))
	const entries = [...group.entries()].sort((a, b) => b[1] - a[1])
	for (const entry of entries) {
		selector.appendChild(createSelectOption(entry[0], `${entry[0]} (${entry[1]})`))
	}
	selector.onchange = refresh

	return selector
}

function downloadData() {
	const content = JSON.stringify(allItems)

	const date = new Date()
	const filename = `seattleBuildings.json`
	const link = document.createElement('a')
	link.style.display = 'none'

	// const file = new Blob([content], { type: "text/json" })
	// link.href = URL.createObjectURL(file)
	link.href = 'data:text/json,' + encodeURIComponent(content)
	link.download = filename
	document.body.appendChild(link)						// FireFox support

	link.click()
}

async function main() {
	const mainPanel = document.getElementById('main')!
	const loadingLabel = mainPanel.appendChild(document.createElement('div'))
	loadingLabel.innerText = 'Loading...'

	await loadData()

	loadingLabel.remove()

	createControls()
	drawChart('Residential', 'New', 'Completed')
}

function drawChart(permitClass?: string, subType?: string, status?: string) {
	// let items = allItems.filter((o: any) => o.status === 'Completed' && o.completed)
	let items = allItems

	if (permitClass) {
		items = items.filter(o => o.permitClass === permitClass)
	}

	if (subType) {
		items = items.filter(o => o.permitSubType === subType)
	}

	let dateKey: 'completed' | 'issued' = 'completed'
	if (status) {
		items = items.filter(o => o.status === status)
		if (status !== 'Completed') {
			dateKey = 'issued'
		}
	}

	const title = `${subType} ${permitClass}`
	createChart(items, title, dateKey)
	renderMap(items)
}

function createChart(items: Row[], title: string, dateKey: 'completed' | 'issued' | 'expires' = 'completed') {
	console.log(`${title}: ${items.length} items`)

	// const dates = items.map((o: any) => new Date(o.completed))
	//     .filter(o => o)

	// const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
	// const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

	// console.log(`minDate: ${minDate}`)
	// console.log(`maxDate: ${maxDate}`)

	let groups = new Map<number, any[]>()
	for (const item of items) {
		const dateString = item[dateKey]
		if (dateString) {
			const date = new Date(item[dateKey])
			const key = new Date(date.getFullYear(), date.getMonth()).getTime()
			const group = groups.get(key)
			if (group) {
				group.push(item)
			} else {
				groups.set(key, [item])
			}
		}
	}

	const keys = [...groups.keys()].sort((a, b) => a - b)
	// for (const key of keys) {
	//     const count = grouped.get(key)
	//     console.log(`${new Date(key).toDateString()}: ${count}`)
	// }

	const canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
	canvas.style.width = '800px'
	canvas.style.height = '500px'
	const ctx = canvas.getContext('2d')!

	const chartData: Chart.ChartData = {
		labels: keys.map(o => new Date(o).toDateString()),
		datasets: [{
			backgroundColor: '#505090',
			// borderColor: '#505090',
			borderWidth: 1,
			barPercentage: 1.0,
			categoryPercentage: 1.0,
			data: keys.map(o => groups.get(o)!.length)
		}]
	}

	const onClick = (event?: MouseEvent, activeElements?: any[]) => {
		console.log(`onClick ${activeElements?.length}`)
		if (activeElements && activeElements.length > 0) {
			const chartElement = activeElements[0]
			const index: number = Number(chartElement._index)
			const key = keys[index]
			const group = groups.get(key)
			if (group) {
				const date = new Date(key)
				const title = date.toDateString()
				showGroup(group, title)
			}
		}
	}

	const config: Chart.ChartConfiguration = {
		type: 'bar',
		data: chartData,
		options: {
			responsive: true,
			animation: {
				duration: 0 // general animation time
			},
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			},
			legend: {
				position: 'top',
				display: false,
			},
			title: {
				display: true,
				text: title
			},
			onClick: onClick
		}
	}

	if (chart) {
		chart.destroy()
		chart = new Chart(ctx, config)
		// chart.data.datasets!.forEach((dataset) => {
		// 	dataset.data!.pop()
		// })
		// config.data!.datasets!.forEach((dataset) => {
		// 	chart.data!.datasets!.push(dataset)
		// })

		// chart.update({duration: 0})
	} else {
		chart = new Chart(ctx, config)
	}
}

function showGroup(group: any[], title: string) {
	console.log(`showGroup ${group.length}`)
	console.log(group)

	clearLog()
	log(`${title}, ${group.length} items:\n`)
	for (const item of group) {
		log(JSON.stringify(item) + ',\n')
	}
}

function clearLog() {
	const panel = document.getElementById('log') as HTMLDivElement
	panel.innerText = ''
}

function log(msg: string) {
	const panel = document.getElementById('log') as HTMLDivElement
	panel.innerText = panel.innerText + msg + '\n'
}

function renderMap(items: Row[]) {
	const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement
	const renderer = new MapRenderer(canvas)
	renderer.renderMap(items)

	canvas.style.display = ''
}

main()
