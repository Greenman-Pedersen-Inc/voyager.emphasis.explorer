define(['./app/Utilities.js', './app/staticData/filterItems/api.js', './app/ui/map/MapSources.js'], function (
    Utilities,
    api,
    MapSources
) {
    function getSRIData(filterParameters, credentials) {
        const sriQuery = api.GetSriQuery(filterParameters);
        const headers = {
            headers: {
                token: credentials.token,
            },
        };

        if (filterParameters.locationFilters.sri.value) {
            return fetch(sriQuery, headers)
                .then(function (response) {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        return Promise.resolve({ features: [], type: 'FeatureCollection' });
                    }
                })
                .then((features) => {
                    return features;
                })
                .catch(Utilities.errorHandler);
        } else {
            return Promise.resolve({ features: [], type: 'FeatureCollection' });
        }
    }

    function updateHeatmapPaint(map, colorRamp, layerDefinition, clusterAttributes) {
        function createHeatmapScheme(colorRamp) {
            const colorFill = JSON.parse(
                JSON.stringify(layerDefinition.legend[layerDefinition.legend.type + '-color'])
            );

            for (let index = 0; index < colorRamp.length; index++) {
                let item = colorRamp[index];
                colorFill.push(item.from);
                colorFill.push(item.color);
            }
            // if (colorRamp.length > 2) {
            //     colorFill.push(colorRamp[colorRamp.length - 1].to);
            //     colorFill.push(colorRamp[colorRamp.length - 1].color);
            // }

            return colorFill;
        }

        if (colorRamp.length == 0) {
            map.setPaintProperty(layerDefinition.id, layerDefinition.legend.type + '-opacity', 0);
        } else {
            const colorFill = createHeatmapScheme(colorRamp);

            map.setPaintProperty(layerDefinition.id, layerDefinition.legend.type + '-color', colorFill);
            map.setPaintProperty(layerDefinition.id, layerDefinition.legend.type + '-opacity', 1);

            if (clusterAttributes.paint) {
                Object.keys(clusterAttributes.paint).forEach((key) => {
                    console.log(key, clusterAttributes.paint[key]);
                    map.setPaintProperty(layerDefinition.id, key, clusterAttributes.paint[key]);
                });
            }
            map.triggerRepaint();
        }
    }

    return function SRIClusters(map, sourceID, credentials) {
        const self = this;
        const mapSources = new MapSources(map);
        const layerDefinition = mapSources.getLayerDefinition(sourceID);
        const clusterAttributes = mapSources.getMapLayerData(layerDefinition.id);
        const layers = layerDefinition.layers;
        let sriData = {
            type: 'FeatureCollection',
            features: [],
        };

        this['_disabled'] = true;

        Object.defineProperty(this, 'disabled', {
            get: function () {
                return this['_disabled'];
            },
            set: function (value) {
                this['_disabled'] = value;
                map.getLayer('sri_crashes_points').disabled = value;
            },
            enumerable: false,
        });
        Object.defineProperty(this, 'visible', {
            get: function () {
                return this['_visible'];
            },
            set: function (value) {
                this['_visible'] = value;

                layers.forEach((layer) => {
                    map.setLayoutProperty(layer.id, 'visibility', value ? 'visible' : 'none');
                });
            },
            enumerable: false,
        });

        this.addToMap = function () {
            map.addSource(sourceID, {
                type: layerDefinition.type,
                data: sriData,
                attribution: 'New Jersey Department of Treasury NJTR-1 Reports',
            });

            layers.forEach((layer) => {
                map.addLayer(layer);
                if (layer.id === 'sri_crashes_points') {
                    const loadedLayer = map.getLayer(layer.id);

                    loadedLayer._disabled = layerDefinition.disabled || true;

                    Object.defineProperty(loadedLayer, 'disabled', {
                        get: function () {
                            return this['_disabled'];
                        },
                        set: function (value) {
                            this['_disabled'] = value;

                            loadedLayer._disabled = value;
                            layers.forEach((relatedLayer) => {
                                if (relatedLayer.id !== loadedLayer.id) {
                                    map.getLayer(relatedLayer.id).disabled = value;
                                }
                            });

                            self.visible = !value;
                        },
                        enumerable: false,
                    });
                }
            });
        };
        this.update = function (filterParameters) {
            getSRIData(filterParameters, credentials).then((sriData) => {
                map.getSource(sourceID).setData(sriData);

                if (self.visible) {
                    map.triggerRepaint();
                    map.legend.update();
                }

                if (sriData.features && sriData.features.length > 0) {
                    let colorRamp = self.legendCard.update(
                        filterParameters,
                        sriData.features,
                        'visible',
                        true,
                        true,
                        true
                    );
                    let bounds = new mapboxgl.LngLatBounds(
                        sriData.features[0].geometry.coordinates,
                        sriData.features[0].geometry.coordinates
                    );

                    updateHeatmapPaint(map, colorRamp, layerDefinition, clusterAttributes);

                    if (self.legendCard) {
                        self.legendCard.loadingIndicator.classList.add('hidden');
                    }

                    sriData.features.forEach((feature) => bounds.extend(feature.geometry.coordinates));
                    map.fitBounds(bounds, { padding: 50 });
                }
            });
        };

        map.addSource(sourceID, {
            type: layerDefinition.type,
            data: sriData,
            attribution: 'New Jersey Department of Treasury NJTR-1 Reports',
        });

        layers.forEach((layer) => {
            map.addLayer(layer);
            if (layer.id === 'sri_crashes_points') {
                const loadedLayer = map.getLayer(layer.id);

                loadedLayer._disabled = true;

                Object.defineProperty(loadedLayer, 'disabled', {
                    get: function () {
                        return this['_disabled'];
                    },
                    set: function (value) {
                        this['_disabled'] = value;

                        loadedLayer._disabled = value;
                        layers.forEach((relatedLayer) => {
                            if (relatedLayer.id !== loadedLayer.id) {
                                map.getLayer(relatedLayer.id).disabled = value;
                            }
                        });

                        self.visible = !value;
                    },
                    enumerable: false,
                });
            }

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

        this.legendCard = map.legend.addLayer(layerDefinition, sriData, true);
    };
});
