export function process(store, order) {
    let availableStock = store.map(item => ({ ...item }));

    let assignment = [];
    let mismatches = 0;
    let stats = {};

    for (const customer of order) {
        let assigned = false;

        if (customer.size.length === 1) {
            const size = customer.size[0];
            const stockItem = availableStock.find(item => item.size === size && item.quantity > 0);

            if (stockItem) {
                assigned = true;
                stockItem.quantity--;
                assignment.push({ id: customer.id, size: size });
                stats[size] = (stats[size] || 0) + 1;
            }
        } else {
            const [size1, size2] = customer.size;
            const preferredSize = customer.masterSize === "s1" ? size1 : size2;
            const alternateSize = customer.masterSize === "s1" ? size2 : size1;

            let stockItem = availableStock.find(item => item.size === preferredSize && item.quantity > 0);

            if (stockItem) {
                assigned = true;
                stockItem.quantity--;
                assignment.push({ id: customer.id, size: preferredSize });
                stats[preferredSize] = (stats[preferredSize] || 0) + 1;
            } else {
                stockItem = availableStock.find(item => item.size === alternateSize && item.quantity > 0);

                if (stockItem) {
                    assigned = true;
                    stockItem.quantity--;
                    assignment.push({ id: customer.id, size: alternateSize });
                    stats[alternateSize] = (stats[alternateSize] || 0) + 1;
                    mismatches++;
                }
            }
        }

        if (!assigned) {
            return false;
        }
    }

    const formattedStats = Object.entries(stats)
        .map(([size, quantity]) => ({ size: Number(size), quantity }))
        .sort((a, b) => a.size - b.size);

    return {
        stats: formattedStats,
        assignment,
        mismatches
    };
}

const store = [
    { size: 1, quantity: 3 },
    { size: 2, quantity: 2 },
    { size: 3, quantity: 1 }
];

const order = [
    { id: 100, size: [1] },
    { id: 101, size: [2] },
    { id: 102, size: [2, 3], masterSize: "s1" },
    { id: 103, size: [1, 2], masterSize: "s2" }
];

const result = process(store, order);

console.log(result);

