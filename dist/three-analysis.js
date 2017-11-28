// Version 0.0.0 three-analysis - https://github.com/hanmag/three.analysis#readme
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('kapsule')) :
	typeof define === 'function' && define.amd ? define(['kapsule'], factory) :
	(global.ThreeAnalysis = factory(global.Kapsule));
}(this, (function (Kapsule) { 'use strict';

Kapsule = Kapsule && Kapsule.hasOwnProperty('default') ? Kapsule['default'] : Kapsule;

var index = Kapsule({
    props: {
        width: {
            default: window.innerWidth
        },
        height: {
            default: window.innerHeight
        }
    },
    init: function () {},
    update: function () {}
});

return index;

})));
//# sourceMappingURL=three-analysis.js.map
