const rate = 0.4, base = 0.9;

function linearNumericItems(items, numField) {
    let min = Infinity,
        max = -Infinity;
    items.forEach(item => {
        min = Math.min(min, item[numField]);
        max = Math.max(max, item[numField]);
    });
    return {
        minim: min,
        maxim: max,
        median: (max - min) / 2
    };
}

function linearSizeItems(items, sizeField) {
    if (typeof sizeField !== 'string') return;
    const numeric = linearNumericItems(items, sizeField);
    items.forEach(item => {
        item._size = base + ((item[sizeField] - numeric.minim) / (numeric.median - numeric.minim)) * rate;
        if (isNaN(item._size)) item._size = 1.0;
    });
}

export { linearSizeItems };