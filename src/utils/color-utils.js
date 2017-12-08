function autoColorItems(items, colorField) {
    if (typeof colorField !== 'string') return;

    // d3.scale.category10
    const colors = [0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf];

    const colorGroups = {};

    items.forEach(item => {
        colorGroups[item[colorField]] = null;
    });
    Object.keys(colorGroups).forEach((group, idx) => {
        colorGroups[group] = idx
    });

    items.forEach(item => {
        item._color = colors[colorGroups[item[colorField]] % colors.length];
    });
}

export {
    autoColorItems
};