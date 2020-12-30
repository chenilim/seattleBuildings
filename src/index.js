let rows
let allItems

async function loadData() {
    const url = './rows.json'
    const response = await fetch(url)
    rows = await response.json()

    allItems = rows.data.map(r => ({
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

async function main() {
    await loadData()

    const items = allItems.filter(o => o.permitClass === 'Residential' && o.completedDate !== null)
    console.log(`${items.length} filtered items`)

    const dates = items.map(o => o.completedDate)
        .filter(o => o)

    const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    console.log(`minDate: ${minDate}`)
    console.log(`maxDate: ${maxDate}`)

    let yearCounts = {}
    for (item of items) {
        const year = item.completedDate.getFullYear()
        const yearCount = yearCounts[year]
        if (yearCount) {
            yearCounts[year] = yearCount + 1
        } else {
            yearCounts[year] = 1
        }
    }

    for (year of Object.keys(yearCounts)) {
        const count = yearCounts[year]
        console.log(`${year}: ${count}`)
    }
}

main()
