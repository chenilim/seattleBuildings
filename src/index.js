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

function group(items, mapper) {
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

    const items = allItems.filter(o => o.permitClass === 'Residential' && o.completedDate !== null)
    console.log(`${items.length} filtered items`)

    const dates = items.map(o => o.completedDate)
        .filter(o => o)

    const minDate = dates.reduce(function (a, b) { return a < b ? a : b })
    const maxDate = dates.reduce(function (a, b) { return a > b ? a : b })

    console.log(`minDate: ${minDate}`)
    console.log(`maxDate: ${maxDate}`)

    const permitClasses = group(allItems, o => o.permitSubClass)
    for (key of permitClasses.keys()) {
        console.log(`${key}: ${permitClasses.get(key)}`)
    }

    let yearCounts = new Map()
    for (item of items) {
        const year = item.completedDate.getFullYear()
        const yearCount = yearCounts.get(year)
        if (yearCount) {
            yearCounts.set(year, yearCount + 1)
        } else {
            yearCounts.set(year, 1)
        }
    }

    const years = [...yearCounts.keys()].sort((a, b) => a - b)
    for (year of years) {
        const count = yearCounts.get(year)
        console.log(`${year}: ${count}`)
    }
}

main()
