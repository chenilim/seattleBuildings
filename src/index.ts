import './main.css'
import * as Chart from 'chart.js'

let rows: any = []
let allItems: any[] = []
let chart: Chart

async function loadData(): Promise<void> {
	console.log(`LoadData...`)

    const url = './rows.json'
    const response = await fetch(url)
	console.log(`Loading JSON...`)
    rows = await response.json()

	console.log(`Parsing JSON...`)
    allItems = rows.data.map((r: any) => ({
        permitSubClass: r[9],
        permitClass: r[10],
        permitType: r[11],
        permitSubType: r[12],
        description: r[13],
        completed: r[21],
        completedDate: r[21] && new Date(r[21]),
        status: r[22]
    }))

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

function createControls() {
	const selectClass = document.getElementById('selectType') as HTMLSelectElement
	selectClass.onchange = (e) => {
		drawChart(selectClass.value, selectNew.value)
	}

	const selectNew = document.getElementById('selectNew') as HTMLSelectElement
	selectNew.onchange = (e) => {
		drawChart(selectClass.value, selectNew.value)
	}
}

async function main() {
    await loadData()

    // console.log('Permit classes:')
    // const permitClasses = group(allItems, o => o.permitClass + '-' + o.permitSubClass)
    // for (const key of permitClasses.keys()) {
    //     console.log(`${key}: ${permitClasses.get(key)}`)
    // }

    // console.log('Permit types:')
    // const permitTypes = group(allItems, o => o.permitType + '-' + o.permitSubType)
    // for (const key of permitTypes.keys()) {
    //     console.log(`${key}: ${permitTypes.get(key)}`)
	// }

	createControls()
	drawChart('residential', 'new')
}

function drawChart(permitClass: string, isNew: string) {
	let items = allItems.filter((o: any) => o.status === 'Completed' && o.completedDate !== null)

	switch (permitClass) {
		case 'residential': {
			items = items.filter(o => o.permitClass === 'Residential')
			break
		}
		case 'non-residential': {
			items = items.filter(o => o.permitClass === 'Non-Residential')
			break
		}
	}

	switch (isNew) {
		case 'new': {
			items = items.filter(o => o.permitSubType === 'New')
			break
		}
		case 'existing': {
			items = items.filter(o => o.permitSubType !== 'New')
			break
		}
	}

	const title = `${isNew.charAt(0).toUpperCase() + isNew.slice(1)} ${permitClass}`
	createChart(items, title)
}

function createChart(items: any[], title: string) {
    console.log(`${title}: ${items.length} items`)

    // const dates = items.map((o: any) => o.completedDate)
    //     .filter(o => o)

    // const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    // const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    // console.log(`minDate: ${minDate}`)
    // console.log(`maxDate: ${maxDate}`)

    let groups = new Map<number, any[]>()
    for (const item of items) {
        const key = new Date(item.completedDate.getFullYear(), item.completedDate.getMonth()).getTime()
        const group = groups.get(key)
        if (group) {
			group.push(item)
        } else {
			groups.set(key, [item])
        }
    }

    const keys = [...groups.keys()].sort((a, b) => a - b)
    // for (const key of keys) {
    //     const count = grouped.get(key)
    //     console.log(`${new Date(key).toDateString()}: ${count}`)
    // }

    const canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
    canvas.style.maxWidth = '800px'
    canvas.style.maxHeight = '500px'
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
		log(JSON.stringify(item) + '\n')
	}
}

function clearLog() {
	const panel = document.getElementById('sidebar') as HTMLDivElement
	panel.innerText = ''
}

function log(msg: string) {
	const panel = document.getElementById('sidebar') as HTMLDivElement
	panel.innerText = panel.innerText + msg + '\n'
}

main()
