import { schemePaired } from 'd3-scale-chromatic';
import tinyColor from 'tinycolor2';

const colorStr2Hex = str => isNaN(str) ? parseInt(tinyColor(str).toHex(), 16) : str;

function autoColorItems(items, colorField) {
    if (typeof colorField !== 'string') return;

    const colors = schemePaired; // Paired color set from color brewer

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

export { autoColorItems, colorStr2Hex };