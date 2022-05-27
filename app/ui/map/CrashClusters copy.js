define([
    './app/Utilities.js',
    "./app/ui/map/MapSources.js",
    "./app/staticData/filterItems/api.js"
], function(
    Utilities,
    MapSources,
    api
) {
    function getCrashData(map, filterParameters, minzoom, maxzoom) {
        let mapBounds = map.getBounds();
        let mapZoom = map.getZoom();
        let crashQuery = api.GetCrashesQuery(filterParameters, mapBounds);

        if (Utilities.evaluateZoomVisibility(mapZoom, minzoom, maxzoom)) {
            return fetch(crashQuery)
                .then(function(response) {
                    if (response.status === 200) {
                        return response.json()
                    } else {
                        return Promise.resolve({ features: [], type: "FeatureCollection" })
                    }
                })
                .then(features => { return features })
                .catch(Utilities.errorHandler);
        } else {
            return Promise.resolve({ features: [], type: "FeatureCollection" })
        }
    }

    function updateHeatmapPaint(map, legendScheme, attributes) {
        function createHeatmapScheme(legendScheme) {
            var colorFill = JSON.parse(JSON.stringify(attributes.legend[attributes.legend.type + '-color']));

            // var legendSchemeReverse = legendScheme.reverse();
            // if (legendSchemeReverse.length == 3) {
            //     // take the 2nd pair
            //     colorFill.push(colorArray[0]);
            //     colorFill.push(legendSchemeReverse[1].from);
            //     colorFill.push(colorArray[1]);
            //     colorFill.push(legendSchemeReverse[1].to + 1);
            //     colorFill.push(colorArray[2]);
            // }

            for (let index = 0; index < legendScheme.length; index++) {
                const item = legendScheme[index];
                colorFill.push(item.from);
                colorFill.push(item.color);
            }

            // if (legendScheme.length > 1) {
            //     colorFill.push(legendScheme[legendScheme.length - 1].to);
            //     colorFill.push(legendScheme[legendScheme.length - 1].color);
            // }

            return colorFill;
        }

        var layerId = attributes.legend.layer;

        if (legendScheme.length == 0) {
            map.setPaintProperty(layerId, attributes.legend.type + '-opacity', 0);
        } else {
            var colorFill = createHeatmapScheme(legendScheme);
            map.setPaintProperty(layerId, attributes.legend.type + '-color', colorFill);
            map.setPaintProperty(layerId, attributes.legend.type + '-opacity', 1);

            // for (let index = 0; index < attributes.layers.length; index++) {
            //     var aLayer = attributes.layers[index];
            //     if (aLayer.id == clusterLayerName) return aLayer;
            // }

            // if (self.clusterAttributes.paint) {
            //     Object.keys(self.clusterAttributes.paint).forEach(key => {
            //         map.setPaintProperty(layerId, key, self.clusterAttributes.paint[key]);
            //     });
            // }
        }
    }

    return function CrashClusters(map, sourceID) {
        const self = this;
        const mapSources = new MapSources(map);
        const layerDefinition = mapSources.getLayerDefinition(sourceID);

        Object.defineProperty(this, 'disabled', {
            get: function() {
                return this['_disabled'];
            },
            set: function(value) {
                this['_disabled'] = value;

                self.layers.forEach(layer => {
                    map.getLayer(layer.id).disabled = value;
                })

                if (value) {
                    map.getLayer('clusters').visibility = 'none';
                    map.getLayer('cluster-count').visibility = 'none';
                    map.getLayer('unclustered-point').visibility = 'none';
                    map.getLayer('uncluster-count').visibility = 'none';
                } else {
                    map.getLayer('clusters').visibility = 'visible';
                    map.getLayer('cluster-count').visibility = 'visible';
                    map.getLayer('unclustered-point').visibility = 'visible';
                    map.getLayer('uncluster-count').visibility = 'visible';

                    self.update(map.filterParameters);
                }
            },
            enumerable: false
        });
        Object.defineProperty(layerDefinition, 'visible', {
            get: function() {
                return this['_visible'];
            },
            set: function(value) {
                this['_visible'] = value;

                self.layers.forEach(layer => {
                    map.setLayoutProperty(layer.id, 'visibility', value ? 'visible' : 'none');
                })
            },
            enumerable: false
        });


        this.layers = layerDefinition.layers
        let crashData = {
            "type": "FeatureCollection",
            "features": []
        };

        map.addSource(layerDefinition.sourceName, {
            type: layerDefinition.type,
            data: crashData,
            cluster: layerDefinition.cluster,
            clusterRadius: layerDefinition.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
            attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
        });

        self.layers.forEach(layer => {
            map.addLayer(layer);

            if (layer.mouseleave) {
                map.on('mouseleave', layer.id, layer.mouseleave);
            } else {
                map.on('mouseenter', layer.id, function() {
                    map.getCanvas().style.cursor = 'pointer';
                });
            }
            if (layer.mouseenter) {
                map.on('mouseenter', layer.id, layer.mouseenter);
            } else {
                map.on('mouseleave', layer.id, function() {
                    map.getCanvas().style.cursor = '';
                });
            }

            if (layer.id === 'clusters') {
                self.clusterAttributes = layer;
            }
        });

        self.legendCard = map.legend.addLayer(layerDefinition, crashData, 'visible', true, true, true);

        map.on('sourcedata', sourceUpdate);

        map.updateCrashClusters = function(filterParameters) {
            self.update(filterParameters);
        }
        this.addToMap = function() {
            map.addSource(layerDefinition.sourceName, {
                type: layerDefinition.type,
                data: crashData,
                cluster: layerDefinition.cluster,
                clusterRadius: layerDefinition.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
                attribution: 'New Jersey Department of Treasury NJTR-1 Reports'
            });

            self.layers.forEach(layer => {
                map.addLayer(layer);
            });
        }
        this.update = function(filterParameters) {
            self.legendCard.loadingIndicator.classList.remove('hidden');
            getCrashData(map, filterParameters, layerDefinition.minzoom, layerDefinition.maxzoom)
                .then(crashData => {
                    if (crashData) {
                        if (map.getSource(layerDefinition.sourceName)) {
                            map.getSource(layerDefinition.sourceName).setData(crashData);
                            map.triggerRepaint();
                        } else {

                        }
                    }
                })
        }
        this.getClusterAttributes = function() {

        }

        function sourceUpdate(source) {
            if (source.isSourceLoaded) {
                let features = map.queryRenderedFeatures({ layers: layerDefinition.layers.filter(layer => layer.type === 'circle').map(layer => layer.id) });

                if (self.legendCard) {
                    updateHeatmapPaint(map, self.legendCard.update(map.filterParameters, features, 'visible', true, true, true), layerDefinition)
                    self.legendCard.loadingIndicator.classList.add('hidden');
                }
            }
        }
    }
});