import * as Chart from 'chart.js'
import { create } from 'domain'

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

    console.log('Permit classes:')
    const permitClasses = group(allItems, o => o.permitClass + '-' + o.permitSubClass)
    for (const key of permitClasses.keys()) {
        console.log(`${key}: ${permitClasses.get(key)}`)
    }

    console.log('Permit types:')
    const permitTypes = group(allItems, o => o.permitType + '-' + o.permitSubType)
    for (const key of permitTypes.keys()) {
        console.log(`${key}: ${permitTypes.get(key)}`)
    }

    {
        const items = allItems.filter((o: any) => o.permitSubClass === 'Commercial' && o.completedDate !== null)
        createChart(items, 'All Commercial')
    }

    {
        const items = allItems.filter((o: any) => o.permitClass === 'Residential' && o.completedDate !== null)
        createChart(items, 'All Residential')
    }

    // const items = allItems.filter((o: any) => o.permitSubClass === 'Single Family/Duplex' && o.completedDate !== null)
    {
        const items = allItems.filter((o: any) =>
            o.permitClass === 'Residential' &&
            o.permitType === 'Building' &&
            o.permitSubType === 'New' &&
            o.completedDate !== null)
        createChart(items, 'Residential New Construction')
    }
}

function createChart(items: any[], title: string) {
    console.log(`${title}: ${items.length} items`)

    // const dates = items.map((o: any) => o.completedDate)
    //     .filter(o => o)

    // const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    // const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    // console.log(`minDate: ${minDate}`)
    // console.log(`maxDate: ${maxDate}`)

    let grouped = new Map()
    for (const item of items) {
        const key = new Date(item.completedDate.getFullYear(), item.completedDate.getMonth()).getTime()
        const count = grouped.get(key)
        if (count) {
            grouped.set(key, count + 1)
        } else {
            grouped.set(key, 1)
        }
    }

    const keys = [...grouped.keys()].sort((a, b) => a - b)
    // for (const key of keys) {
    //     const count = grouped.get(key)
    //     console.log(`${new Date(key).toDateString()}: ${count}`)
    // }

    const canvas = document.createElement('canvas')
    canvas.style.maxWidth = '800px'
    canvas.style.maxHeight = '500px'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!

    const chartData: Chart.ChartData = {
        labels: keys.map(o => new Date(o).toDateString()),
        datasets: [{
            backgroundColor: Chart.helpers.color('#505090').alpha(0.5).rgbString(),
            borderColor: '#505090',
            borderWidth: 1,
            data: keys.map(o => grouped.get(o))
        }]
    }

    const config: Chart.ChartConfiguration = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
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
            }
        }
    }

    var myChart = new Chart(ctx, config)
}

main()
