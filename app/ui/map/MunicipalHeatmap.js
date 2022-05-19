define([
    "./app/staticData/filterItems/api.js",
    "./app/ui/map/MapSources.js",
    "./app/ui/map/Popup.js",
], function(
    api,
    MapSources,
    Popup
) {
    function createColorRamp(features) {
        let colorRange = [];

        function getBounds(someArrayOfObjects) {
            if (someArrayOfObjects.length == 0) {
                return {
                    max: 1,
                    min: 1
                };
            }

            let values = someArrayOfObjects.map(item => item['properties']['crashes']);
            let minValue = Math.min.apply(null, values);
            let maxValue = Math.max.apply(null, values);
            let rangeValue = maxValue - minValue;

            return {
                max: maxValue,
                min: minValue,
                range: rangeValue
            };
        }

        if (features.length > 0) {
            let colorArray = ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'];
            let bounds = getBounds(features);
            let lowerBound = 1;

            if (bounds.range > colorArray.length) {
                var bucketSize = Math.floor(bounds.range / colorArray.length);
                for (var i = 0; i < colorArray.length; i++) {
                    if (i == colorArray.length - 1) {
                        colorRange.push({
                            from: lowerBound,
                            to: bounds.max,
                            color: colorArray[i],
                        });
                    } else {
                        colorRange.push({
                            from: lowerBound,
                            to: lowerBound + bucketSize - 1,
                            color: colorArray[i],
                        });
                        lowerBound = lowerBound + bucketSize;
                    }
                }
            } else if (bounds.range <= 1) {
                colorRange.push({
                    from: bounds.min,
                    to: bounds.max,
                    color: '#f45d4c',
                });
            } else {
                for (var i = 0; i < bounds.max - 1; i++) {
                    colorRange.push({
                        from: i + 1,
                        to: i + 2,
                        color: colorArray[i],
                    });
                }
            }
        }

        return colorRange;
    }

    function createHeatmapScheme(colorRamp) {
        let colorFill = ['interpolate', ['linear'],
            ['get', 'crashes']
        ];

        colorRamp.forEach(item => {
            colorFill.push(item.from);
            colorFill.push(item.color);
        });

        // if (legendScheme.length > 1) {
        //     colorFill.push(legendScheme[legendScheme.length - 1].to);
        //     colorFill.push(legendScheme[legendScheme.length - 1].color);
        // }

        return colorFill;
    }

    function updateHeatmapPaint(map, colorRamp, layerData) {
        let colorFill;
        let layerId = layerData.id;

        if (colorRamp.length == 0) {
            map.setPaintProperty(layerId, 'fill-opacity', 0);
        } else {
            colorFill = createHeatmapScheme(colorRamp);
            map.setPaintProperty(layerId, layerData.type + '-color', colorFill);

            if (layerData.paintAttributes) {
                Object.keys(layerData.paintAttributes).forEach(attr => {
                    map.setPaintProperty(layerId, attr, layerData.paintAttributes[attr]);
                });
            } else {
                map.setPaintProperty(layerId, layerData.type + '-opacity', 1);
            }
        }
    }

    return function MunicipalHeatmap(map, sourceID, layerID, beforeLayer) {
        const self = this;
        const mapSources = new MapSources(map);
        const layerDefinition = mapSources.getMapLayerData(layerID);

        Object.defineProperty(this, 'disabled', {
            get: function() {
                return this['_disabled'];
            },
            set: function(value) {
                this['_disabled'] = value;

                // layerDefinition.layers.forEach(layer => {
                map.getLayer(layerDefinition.id).disabled = value;
                // })

                if (value) {
                    map.getLayer(layerDefinition.id).visibility = 'none';
                } else {
                    map.getLayer(layerDefinition.id).visibility = 'visible';
                }
            },
            enumerable: false
        });

        var heatMapQuery = api.GetMuniHeatmapQuery(map.filterParameters);

        layerDefinition['source-layer'] = heatMapQuery.sourceLayer;

        map.addSource(layerDefinition.source, {
            type: 'vector',
            tiles: [heatMapQuery.tileEndpoint],
            attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
        });
        map.addLayer(layerDefinition, beforeLayer);

        function initializeLayer(response) {
            if (map.getSource(layerDefinition.source) && map.isSourceLoaded(layerDefinition.source)) {
                let features = map.querySourceFeatures(layerDefinition.source, {
                    sourceLayer: map.getLayer(layerDefinition.id).sourceLayer
                });

                self.legendCard = map.legend.addLayer(layerDefinition, features, 'visible', true, true, true);

                map.off('sourcedata', initializeLayer);
                map.on('sourcedata', self.update);
            }
        }

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

        this.addToMap = function() {
            map.addSource(layerDefinition.source, {
                type: 'vector',
                tiles: [heatMapQuery.tileEndpoint],
                attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
            });
            map.addLayer(layerDefinition, beforeLayer);
        }
        this.update = function(features) {
            if (self.legendCard) {
                self.legendCard.loadingIndicator.classList.remove('hidden');
            }

            if (map.getSource(layerDefinition.source) && map.isSourceLoaded(layerDefinition.source)) {
                let visibleFeatures = map.queryRenderedFeatures({ layers: ['municipality_outline_layer'] }).map(feature =>
                    `${feature.properties.mun_cty_co}${feature.properties.mun_mu}`
                );
                let sourceFeatures = map.querySourceFeatures(layerDefinition.source, {
                    sourceLayer: map.getLayer(layerDefinition.id).sourceLayer
                }).filter(feature => visibleFeatures.includes(`${feature.properties.mun_cty_co}${feature.properties.mun_mu}`))
                let colorRamp = createColorRamp(sourceFeatures);

                updateHeatmapPaint(map, colorRamp, layerDefinition);

                if (self.legendCard) {
                    self.legendCard.loadingIndicator.classList.add('hidden');
                    self.legendCard.update(map.filterParameters, sourceFeatures, 'visible', true, true, true);
                }
            }
        }
    }
})