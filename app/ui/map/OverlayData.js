define([
    "./app/ui/map/MapSources.js",
], function(
    MapSources,
) {
    return function OverlayData(map) {
        let mapSources = new MapSources(map);
        let staticMapLayers = mapSources.getOverlayLayerDefinitions();

        this.addToMap = function() {
            Object.keys(staticMapLayers).forEach(function(key) {
                var legendGroup = staticMapLayers[key];

                if (legendGroup.layers) {
                    legendGroup.layers.forEach(layerGroup => {
                        if (layerGroup.layers) {
                            layerGroup.layers.forEach(subgroup => {
                                // add the layer and source if they arent on the map already
                                var idName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label;
                                var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_src";
                                var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_data";

                                idName = idName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                                mapSourceName = mapSourceName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                                mapLayerName = mapLayerName.replace(/ /g, "_").replace("/", "_").toLowerCase();

                                if (!map.getSource(mapSourceName)) {
                                    map.addSource(mapSourceName, {
                                        "url": "mapbox://" + subgroup.url,
                                        "type": subgroup.sourceType
                                    });

                                    map.addLayer({
                                        'id': subgroup.id,
                                        'type': subgroup.layerType,
                                        'source': mapSourceName,
                                        'source-layer': subgroup.source,
                                        paint: subgroup.paint,
                                        layout: {
                                            visibility: 'none'
                                        },
                                    }, subgroup.beforeLayer ? subgroup.beforeLayer : '');
                                }
                            });
                        } else {
                            // add the layer and source if they arent on the map already
                            var idName = legendGroup.label + "_" + layerGroup.label;
                            var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_src";
                            var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_data";

                            idName = idName.replace(/ /g, "_").toLowerCase();
                            mapSourceName = mapSourceName.replace(/ /g, "_").toLowerCase();
                            mapLayerName = mapLayerName.replace(/ /g, "_").toLowerCase();

                            if (!map.getSource(mapSourceName)) {
                                map.addSource(mapSourceName, {
                                    "url": "mapbox://" + layerGroup.url,
                                    "type": layerGroup.sourceType
                                });

                                map.addLayer({
                                    'id': layerGroup.id,
                                    'type': layerGroup.layerType,
                                    'source': mapSourceName,
                                    'source-layer': layerGroup.source,
                                    paint: layerGroup.paint,
                                    layout: {
                                        visibility: 'none'
                                    },
                                }, layerGroup.beforeLayer ? layerGroup.beforeLayer : '');
                            }
                        }
                    });
                }
            });
        }


        Object.keys(staticMapLayers).forEach(function(key) {
            var legendGroup = staticMapLayers[key];

            if (legendGroup.layers) {
                legendGroup.layers.forEach(layerGroup => {
                    if (layerGroup.layers) {
                        layerGroup.layers.forEach(subgroup => {
                            // add the layer and source if they arent on the map already
                            var idName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label;
                            var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_src";
                            var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_data";

                            idName = idName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                            mapSourceName = mapSourceName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                            mapLayerName = mapLayerName.replace(/ /g, "_").replace("/", "_").toLowerCase();

                            if (!map.getSource(mapSourceName)) {
                                map.addSource(mapSourceName, {
                                    "url": "mapbox://" + subgroup.url,
                                    "type": subgroup.sourceType
                                });

                                map.addLayer({
                                    'id': subgroup.id,
                                    'type': subgroup.layerType,
                                    'source': mapSourceName,
                                    'source-layer': subgroup.source,
                                    paint: subgroup.paint,
                                    layout: {
                                        visibility: 'none'
                                    },
                                }, subgroup.beforeLayer ? subgroup.beforeLayer : '');

                                if (subgroup.mouseleave) {
                                    map.on('mouseleave', subgroup.id, layerGroup.mouseleave);
                                } else {
                                    map.on('mouseenter', subgroup.id, function() {
                                        map.getCanvas().style.cursor = 'pointer';
                                    });
                                }
                                if (subgroup.mouseenter) {
                                    map.on('mouseenter', subgroup.id, layerGroup.mouseenter);
                                } else {
                                    map.on('mouseleave', subgroup.id, function() {
                                        map.getCanvas().style.cursor = '';
                                    });
                                }
                            }
                        });
                    } else {
                        // add the layer and source if they arent on the map already
                        var idName = legendGroup.label + "_" + layerGroup.label;
                        var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_src";
                        var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_data";

                        idName = idName.replace(/ /g, "_").toLowerCase();
                        mapSourceName = mapSourceName.replace(/ /g, "_").toLowerCase();
                        mapLayerName = mapLayerName.replace(/ /g, "_").toLowerCase();

                        if (!map.getSource(mapSourceName)) {
                            map.addSource(mapSourceName, {
                                "url": "mapbox://" + layerGroup.url,
                                "type": layerGroup.sourceType
                            });

                            map.addLayer({
                                'id': layerGroup.id,
                                'type': layerGroup.layerType,
                                'source': mapSourceName,
                                'source-layer': layerGroup.source,
                                paint: layerGroup.paint,
                                layout: {
                                    visibility: 'none'
                                },
                            }, layerGroup.beforeLayer ? layerGroup.beforeLayer : '');
                            if (layerGroup.mouseleave) {
                                map.on('mouseleave', layerGroup.id, layerGroup.mouseleave);
                            } else {
                                map.on('mouseenter', layerGroup.id, function() {
                                    map.getCanvas().style.cursor = 'pointer';
                                });
                            }
                            if (layerGroup.mouseenter) {
                                map.on('mouseenter', layerGroup.id, layerGroup.mouseenter);
                            } else {
                                map.on('mouseleave', layerGroup.id, function() {
                                    map.getCanvas().style.cursor = '';
                                });
                            }

                        }
                    }
                });
            }

            map.legend.addLayerGroup(legendGroup);
        });
    }
})