define([
    "./app/ui/map/MapSources.js",
], function(
    MapSources,
) {
    return function CrashHeatmap(map, legendHelper) {
        this.addToMap = function(filterParameters) {
            map.addSource(crashHeatmapAttr.name, {
                type: crashHeatmapAttr.type,
                data: crashData
            });

            var crashHeatmapLayerAttr = crashHeatmapAttr.layers[0];

            map.addLayer({
                id: crashHeatmapLayerAttr.id,
                type: crashHeatmapLayerAttr.type,
                source: crashHeatmapLayerAttr.sourceheatmap,
                minzoom: crashHeatmapLayerAttr.minzoom,
                layout: {
                    'visibility': heat ? "visible" : "none"
                },
                paint: crashHeatmapLayerAttr.paint
            });
        }
    }
}
})