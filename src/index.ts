import * as Chart from 'chart.js'

let rows: any
let allItems: any[]

async function loadData(): Promise<void> {
    const url = './rows.json'
    const response = await fetch(url)
    rows = await response.json()

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

function group(items: any[], mapper: (_:any) => any) {
    let counts = new Map()
    for (const item of items) {
        const key = mapper(item)
        const count = counts.get(key)
        counts.set(key, count ? count + 1 : 1)
    }

    return counts
}

async function main() {
    await loadData()

    const items = allItems.filter((o: any) => o.permitClass === 'Residential' && o.completedDate !== null)
    console.log(`${items.length} filtered items`)

    const dates = items.map((o: any) => o.completedDate)
        .filter(o => o)

    const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    console.log(`minDate: ${minDate}`)
    console.log(`maxDate: ${maxDate}`)

    const permitClasses = group(allItems, o => o.permitSubClass)
    for (const key of permitClasses.keys()) {
        console.log(`${key}: ${permitClasses.get(key)}`)
    }

    let yearCounts = new Map()
    for (const item of items) {
        const year = item.completedDate.getFullYear()
        const yearCount = yearCounts.get(year)
        if (yearCount) {
            yearCounts.set(year, yearCount + 1)
        } else {
            yearCounts.set(year, 1)
        }
    }

    const years = [...yearCounts.keys()].sort((a, b) => a - b)
    for (const year of years) {
        const count = yearCounts.get(year)
        console.log(`${year}: ${count}`)
    }

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!

    const chartData: Chart.ChartData = {
        labels: years,
        datasets: [{
            label: 'Completed',
            backgroundColor: Chart.helpers.color('#505090').alpha(0.5).rgbString(),
            borderColor: '#505090',
            borderWidth: 1,
            data: years.map(o => yearCounts.get(o))
        }]
    }

    const config: Chart.ChartConfiguration = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Buildings'
            }
        }
    }

    var myChart = new Chart(ctx, config)
}

main()
