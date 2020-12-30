let rows
let items

async function loadData() {
    const url = './rows.json'
    const response = await fetch(url)
    rows = await response.json()

    items = rows.data.map(r => ({
        permitSubClass: r[9],
        permitClass: r[10],
        permitType: r[11],
        permitSubType: r[12],
        description: r[13],
        completed: r[21],
        completedDate: r[21] && new Date(r[21]),
        status: r[22]
    }))

    console.log(`Loaded ${items.length} rows.`)
}

async function main() {
    await loadData()

    const dates = items.map(o => o.completedDate)
        .filter(o => o)

    const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    console.log(`minDate: ${minDate}`)
    console.log(`maxDate: ${maxDate}`)
}

main()
