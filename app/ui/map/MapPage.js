define([
    "./app/ui/map/BasemapToggle.js",
    "./app/ui/map/CrashClusters.js",
    "./app/ui/map/CountyHeatmap.js",
    "./app/ui/map/JurisdictionBoundaries.js",
    "./app/ui/map/MapSources.js",
    "./app/ui/map/MunicipalHeatmap.js",
    "./app/ui/map/OverlayData.js",
    "./app/ui/map/SRIClusters.js",
    "./app/ui/map/MapFilter.js",
    "./app/ui/map/Legend.js",
    './app/ui/map/Popup.js',
], function(
    BasemapToggle,
    CrashClusters,
    CountyHeatmap,
    JurisdictionBoundaries,
    MapSources,
    MunicipalHeatmap,
    OverlayData,
    SRIClusters,
    MapFilter,
    Legend,
    Popup
) {
    return function MapPage(parent, credentials) {
        mapboxgl.accessToken = 'pk.eyJ1IjoiY29sbGk2NDg1IiwiYSI6ImNrMXNiZHQ1bzBlOTgzY28yMDdsamdncTkifQ.djpUCs34JkPsgWu70lUr_g';

        let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-74.53682654780151, 40.08820519710642],
            zoom: 7.5,
            transformRequest: function (url) {
                if (url.indexOf('gpi') >= 0 || url.indexOf('127.0.0.1') >= 0) {
                    if (credentials && credentials.token) {
                        return {
                            url: url,
                            headers: credentials
                        };
                    } else {
                        console.log('no token submittted');
                    }
                } else {
                    return {
                        url: url
                    };
                }
            }
        });
        let geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            placeholder: 'Search for a location',
            marker: true,
            countries: 'us', // limit results to USA
            bbox: [-75.5600, 38.6500, -73.8800, 41.3600], // further limit results to the geographic bounds representing the region of New Jersey
            // apply a client side filter to further limit results to those strictly within the New Jersey region
            filter: function(item) {
                let results = item.context
                    .map(function(i) {
                        // id is in the form {index}.{id} per https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                        // this example attempts to find the `region` named `New Jersey`
                        return (
                            i.id.split('.').shift() === 'region' &&
                            i.text === 'New Jersey'
                        );
                    })
                    .reduce(function(acc, cur) {
                        return acc || cur;
                    })

                return results;
            }
        });
        const customButtonsDiv = document.getElementById('customButtonsDiv');
        const basemapToggle = new BasemapToggle(map);

        customButtonsDiv.append(basemapToggle.domNode);

        function refreshHandler() {
            if (map.sriClusters.disabled) {
                map.crashClusters.update(parent.filterParameters);
            }

            map.legend.update();
        }

        this.resize = function() { map.resize(); }
        this.update = function(filterParameters, layerChanged = false) {
            if (filterParameters.summary.value === 'nj-summary') {
                map.countyHeatmap.disabled = false;
                map.municipalHeatmap.disabled = false;
                map.crashClusters.disabled = false;
                map.sriClusters.disabled = true;
                map.mapFilter.update(filterParameters, layerChanged);
                map.crashClusters.update(filterParameters); // function added by the crash cluster widget to force update.

                map.setFilter('county_outline_layer', null);
                map.setFilter('municipality_outline_layer', null);
                map.setFilter('county_heatmap_layer', null);
                map.setFilter('muni_heatmap_layer', null);

                map.easeTo({
                    center: [-74.53682654780151, 40.08820519710642],
                    zoom: 7.5
                })
            } else if (filterParameters.summary.value === 'loc-summary') {
                map.countyHeatmap.disabled = false;
                map.municipalHeatmap.disabled = false;
                map.crashClusters.disabled = false;
                map.sriClusters.disabled = true;
                map.mapFilter.update(filterParameters, layerChanged);
                map.crashClusters.update(filterParameters); // function added by the crash cluster widget to force update.

                if (filterParameters.locationFilters.mun_mu.value && filterParameters.locationFilters.mun_cty_co.value) {
                    map.setFilter('county_outline_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);
                    map.setFilter('municipality_outline_layer', ['all', ['==', 'mun_mu', filterParameters.locationFilters.mun_mu.value],
                        ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                    ]);
                    map.setFilter('county_heatmap_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);
                    map.setFilter('muni_heatmap_layer', ['all', ['==', filterParameters.locationFilters.mun_mu.value, ['get', 'mun_mu']],
                        ['==', filterParameters.locationFilters.mun_cty_co.value, ['get', 'mun_cty_co']]
                    ]);

                    let muniFeatures = map.querySourceFeatures('municipality_boundaries', {
                        sourceLayer: 'municipal_boundaries_of_nj',
                        filter: ['all', ['==', 'mun_mu', filterParameters.locationFilters.mun_mu.value],
                            ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                        ]
                    });

                    if (muniFeatures.length > 0) {
                        map.goTo(muniFeatures);
                    } else {
                        let countyFeatures = map.querySourceFeatures('county_boundaries', {
                            sourceLayer: 'county_boundaries_of_nj',
                            filter: ['==', filterParameters.locationFilters.mun_cty_co.value, 'mun_cty_co']
                        })

                        if (countyFeatures.length > 0) {
                            map.once('moveend', function() {
                                let features = map.querySourceFeatures('municipality_boundaries', {
                                    sourceLayer: 'municipal_boundaries_of_nj',
                                    filter: ['all', ['==', 'mun_mu', filterParameters.locationFilters.mun_mu.value],
                                        ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                                    ]
                                })
                                map.goTo(features);
                            })
                            map.goTo(countyFeatures);
                        } else {
                            map.once('moveend', function() {
                                map.once('moveend', function() {
                                    let features = map.querySourceFeatures('municipality_boundaries', {
                                        sourceLayer: 'municipal_boundaries_of_nj',
                                        filter: ['all', ['==', 'mun_mu', filterParameters.locationFilters.mun_mu.value],
                                            ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                                        ]
                                    })
                                    map.goTo(features);
                                })

                                let features = map.querySourceFeatures('county_boundaries', {
                                    sourceLayer: 'county_boundaries_of_nj',
                                    filter: ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                                })

                                map.goTo(features);
                            })

                            map.easeTo({
                                center: [-74.53682654780151, 40.08820519710642],
                                zoom: 7.5
                            })
                        }
                    }
                } else if (filterParameters.locationFilters.mun_cty_co.value) {
                    map.setFilter('county_outline_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);
                    map.setFilter('municipality_outline_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);
                    map.setFilter('county_heatmap_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);
                    map.setFilter('muni_heatmap_layer', ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]);

                    map.once('moveend', function() {
                        let features = map.querySourceFeatures('county_boundaries', {
                            sourceLayer: 'county_boundaries_of_nj',
                            filter: ['==', 'mun_cty_co', filterParameters.locationFilters.mun_cty_co.value]
                        })

                        map.goTo(features);
                    });

                    map.easeTo({
                        center: [-74.53682654780151, 40.08820519710642],
                        zoom: 7.5
                    })
                } else {
                    map.setFilter('county_outline_layer', null);
                    map.setFilter('municipality_outline_layer', null);
                    map.setFilter('county_heatmap_layer', null);
                    map.setFilter('muni_heatmap_layer', null);

                    map.easeTo({
                        center: [-74.53682654780151, 40.08820519710642],
                        zoom: 7.5
                    })
                }
            } else if (filterParameters.summary.value === 'mpo-summary') {
                map.countyHeatmap.disabled = false;
                map.municipalHeatmap.disabled = false;
                map.crashClusters.disabled = false;
                map.sriClusters.disabled = true;
                map.mapFilter.update(filterParameters, layerChanged);
                map.crashClusters.update(filterParameters); // function added by the crash cluster widget to force update.

                if (filterParameters.locationFilters.mun_cty_co.value) {
                    let countyList = filterParameters.locationFilters.mun_cty_co.value
                    let countyFilter = ['any'].concat(countyList.split(',').map(value => ['==', 'mun_cty_co', value]))

                    map.setFilter('county_outline_layer', countyFilter);
                    map.setFilter('municipality_outline_layer', countyFilter);
                    map.setFilter('county_heatmap_layer', countyFilter);
                    map.setFilter('muni_heatmap_layer', countyFilter);

                    map.once('moveend', function() {
                        let features = map.querySourceFeatures('county_boundaries', {
                            sourceLayer: 'county_boundaries_of_nj',
                            filter: countyFilter
                        })

                        map.goTo(features);
                    });

                    map.easeTo({
                        center: [-74.53682654780151, 40.08820519710642],
                        zoom: 7.5
                    })

                } else {
                    map.setFilter('county_outline_layer', null);
                    map.setFilter('municipality_outline_layer', null);
                    map.setFilter('county_heatmap_layer', null);
                    map.setFilter('muni_heatmap_layer', null);

                    map.easeTo({
                        center: [-74.53682654780151, 40.08820519710642],
                        zoom: 7.5
                    })
                }
            } else if (filterParameters.summary.value === 'sri-summary') {
                map.countyHeatmap.disabled = true;
                map.municipalHeatmap.disabled = true;
                map.crashClusters.disabled = true;

                map.setFilter('county_outline_layer', null);
                map.setFilter('municipality_outline_layer', null);

                if (filterParameters.locationFilters.sri.value) {
                    map.sriClusters.disabled = false;
                    map.sriClusters.update(filterParameters);
                } else {
                    map.sriClusters.disabled = true;
                }
            }
        }

        map.on('load', function() {
            map.initialBounds = map.getBounds();
            map.filterParameters = parent.filterParameters;
            map.legend = new Legend(map);
            map.sources = new MapSources(map);
            map.mapFilter = new MapFilter(map);
            map.jurisdictionBoundaries = new JurisdictionBoundaries(map);
            map.countyHeatmap = new CountyHeatmap(map, 'county_heatmap', 'county_heatmap_layer', 'county_outline_layer')
            map.municipalHeatmap = new MunicipalHeatmap(map, 'muni_heatmap', 'muni_heatmap_layer', 'municipality_outline_layer')
            map.crashClusters = new CrashClusters(map, 'ard_accidents');
            map.sriClusters = new SRIClusters(map, 'sri');
            map.overlayData = new OverlayData(map);
            map.addControl(geocoder, 'top-left');
            map.addControl(new mapboxgl.ScaleControl());
            map.addControl(new mapboxgl.NavigationControl());
            map.addControl(new mapboxgl.GeolocateControl());
            map.forceUpdate = function() {
                countyHeatmap.update();
                municipalHeatmap.update();
            }
            map.goTo = function(features) {
                if (features.length > 0) {
                    if (features[0].geometry) {
                        if (features[0].geometry.coordinates && features[0].geometry.coordinates.length > 0) {
                            const bounds = new mapboxgl.LngLatBounds(
                                features[0].geometry.coordinates[0][0],
                                features[0].geometry.coordinates[0][0]
                            );

                            features.forEach(feature => {
                                feature.geometry.coordinates[0].forEach(coordinatePair => {
                                    bounds.extend(coordinatePair);
                                })
                            })

                            map.fitBounds(bounds, {
                                padding: 10
                            });
                        } else {
                            console.log('feature supplied has no coordinates')
                        }
                    } else {
                        console.log('feature supplied has no geometry')
                    }
                } else {
                    console.log('no features supplied');
                }
            }
            map.on('click', function(e) {
                let features = map.queryRenderedFeatures(e.point);
                let uniqueFeatures = []; // vector tile layers return duplicate features
                let popupContent = features.map(feature => {
                    let stringFeature = JSON.stringify(feature); // create shallow copy of feature for comparison

                    if (!uniqueFeatures.includes(stringFeature)) { // check if the feature has already been considered for popup content
                        let layerDefinition = map.sources.getMapLayerData(feature.layer.id);

                        uniqueFeatures.push(stringFeature);
                        if (layerDefinition && layerDefinition.click) {
                            return layerDefinition.click(feature);
                        }
                    }
                }).filter(feature => feature);

                map.off('zoomend', refreshHandler);
                map.off('moveend', refreshHandler);
                new Popup(map, e.lngLat, popupContent, refreshHandler);
            });
            map.on('zoomend', refreshHandler);
            map.on('moveend', refreshHandler);
            map.on('style.load', function() {
                // updating the basemap requires readding the layers
                map.jurisdictionBoundaries.addToMap();
                map.countyHeatmap.addToMap();
                map.municipalHeatmap.addToMap();
                map.crashClusters.addToMap();
                map.sriClusters.addToMap();
                map.overlayData.addToMap();
                refreshHandler();
                map.legend.update();
            });

        });
    }
})