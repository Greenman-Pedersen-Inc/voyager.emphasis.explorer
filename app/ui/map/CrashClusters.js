define([
    './app/Utilities.js',
    "./app/ui/map/MapSources.js",
    "./app/staticData/filterItems/api.js"
], function(
    Utilities,
    MapSources,
    api
) {
    function createColorRamp(features) {
        const colorArray = ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'];
        const colorRange = [];
        // get the unique values from the features as these are what we will visualize
        const featureValues = new Set(features.map((feature) => feature['properties']['crash_count']));
        // convert to array and sort
        const visualizationValues = [...featureValues].sort((a, b) => b - a);
        // get min and max as they will be used to set the gradient
        let minimumValue = Math.min(...visualizationValues);
        const maximumValue = Math.max(...visualizationValues);
        const parts = 5;
        const bucketSize = (maximumValue - minimumValue) / parts;
    
        if (visualizationValues) {
            if (visualizationValues.length > 5) {
                colorArray.forEach((color, index) => {
                    colorRange.push({
                        from: Math.floor(minimumValue + bucketSize * index),
                        to: Math.floor(minimumValue - (index < 4 ? 1 : 0) + bucketSize * (index + 1)),
                        color: color
                    });
                });
            } else if (visualizationValues.length > 0) {
                visualizationValues.forEach((value) => {
                    colorRange.push({
                        from: value,
                        to: value,
                        color: colorArray.pop()
                    });
                });
    
                // mapbox styles require the values to be ascending
                colorRange.sort((a, b) => a.from - b.from);
            } else {
                return colorRange;
            }
        } else {
            return colorRange;
        }
    
        return colorRange;
    }
    
    function updateHeatmapPaint(map, legendScheme, attributes) {
        function createHeatmapScheme(legendScheme) {
            var colorFill = JSON.parse(JSON.stringify(attributes.legend[attributes.legend.type + '-color']));
            for (let index = 0; index < legendScheme.length; index++) {
                const item = legendScheme[index];
                colorFill.push(item.from);
                colorFill.push(item.color);
            }
            return colorFill;
        }

        var layerId = attributes.legend.layer;

        if (legendScheme.length == 0) {
            map.setPaintProperty(layerId, attributes.legend.type + '-opacity', 0);
        } else {
            var colorFill = createHeatmapScheme(legendScheme);
            map.setPaintProperty(layerId, attributes.legend.type + '-color', colorFill);
            map.setPaintProperty(layerId, attributes.legend.type + '-opacity', 1);
        }
    }

    return function CrashClusters(map, sourceID, beforeLayer) {
        const self = this;
        const mapSources = new MapSources(map, map.filterParameters);
        const layerDefinition = mapSources.getLayerDefinition(sourceID);
        const layerGroup = mapSources.getLayerGroupData("ard_accidents");
        const heatMapQuery = api.GetClusterHeatmapQuery(map.filterParameters);

        Object.defineProperty(this, 'disabled', {
            get: function() {
                return this['_disabled'];
            },
            set: function(value) {
                this['_disabled'] = value;

                map.getLayer(layerDefinition.id).disabled = value;


                if (value) {
                    map.getLayer(layerDefinition.id).visibility = 'none';
                } else {
                    map.getLayer(layerDefinition.id).visibility = 'visible';
                }
            },
            enumerable: false
        });

        this.sourceLayer = layerDefinition.sourceLayer;
        this.update = function(source) {
            if (self.legendCard && map.getLayer(layerDefinition.id).visible) {
                self.legendCard.loadingIndicator.classList.remove('hidden');
            }

            if (map.getSource(layerDefinition.source) && map.isSourceLoaded(layerDefinition.source)) {
                // let visibleFeatures = map.queryRenderedFeatures({ layers: ['county_outline_layer'] }).map(feature => feature.properties.mun_cty_co);
                // let sourceFeatures = map.querySourceFeatures(layerDefinition.source, {
                //     sourceLayer: map.getLayer(layerDefinition.id).sourceLayer
                // }).filter(feature => visibleFeatures.includes(feature.properties.mun_cty_co))
                const features = map.queryRenderedFeatures({ layers: [layerGroup.id] });
                let colorRamp = createColorRamp(features);

                updateHeatmapPaint(map, colorRamp, layerDefinition);

                if (self.legendCard) {
                    self.legendCard.loadingIndicator.classList.add('hidden');
                    self.legendCard.update(map.filterParameters, features, 'visible', true, true, true);
                }
            }
        }
        this.addToMap = function() {
            map.addSource(layerDefinition.source, {
                type: 'vector',
                tiles: [heatMapQuery.tileEndpoint],
                attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
            });

            layerGroup.layers.forEach(function (layer) {    
                map.addLayer(layer);
                // map.on('sourcedata', self.updateSource);
    
                if (layer.mouseleave) {
                    map.on('mouseleave', layer.id, layer.mouseleave);
                } else {
                    map.on('mouseenter', layer.id, function () {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                }
                if (layer.mouseenter) {
                    map.on('mouseenter', layer.id, layer.mouseenter);
                } else {
                    map.on('mouseleave', layer.id, function () {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });
            Object.defineProperty(map.getLayer(layerGroup.id), 'visible', {
                get: function () {
                    return this['_visible'];
                },
                set: function (value) {
                    this['_visible'] = value;
    
                    layerGroup.layers.forEach(function (layer) {
                        map.setLayoutProperty(layer.id, 'visibility', value);
                    });
    
                    if (value === 'none') {
                        map.off('sourcedata', self.updateSource);
                    } else {
                        map.on('sourcedata', self.updateSource);
                    }
                },
                enumerable: false
            });
    
            self.disabled = false;
        }

        function initializeLayer(response) {
            if (self['disabled']) return;
            if (map.getSource(layerDefinition.source) && map.isSourceLoaded(layerDefinition.source)) {
                let features = map.querySourceFeatures(layerDefinition.source, {
                    sourceLayer: map.getLayer(layerDefinition.id).sourceLayer
                });

                self.legendCard = map.legend.addLayer(layerDefinition, features, 'visible', true, true, true);
                map.off('sourcedata', initializeLayer);
                map.on('sourcedata', self.update);
            }
        }

        layerDefinition['source-layer'] = heatMapQuery.sourceLayer;

        // map.addSource(layerDefinition.source, {
        //     type: 'vector',
        //     tiles: [heatMapQuery.tileEndpoint],
        //     attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
        // });
        // map.addLayer(layerDefinition, beforeLayer);
        self.addToMap();
        map.on('sourcedata', initializeLayer);

        if (layerDefinition.mouseleave) {
            map.on('mouseleave', layerDefinition.id, layerDefinition.mouseleave);
        } else {
            map.on('mouseenter', layerDefinition.id, function() {
                map.getCanvas().style.cursor = 'pointer';
            });
        }
        if (layerDefinition.mouseenter) {
            map.on('mouseenter', layerDefinition.id, layerDefinition.mouseenter);
        } else {
            map.on('mouseleave', layerDefinition.id, function() {
                map.getCanvas().style.cursor = '';
            });
        }
    }
});