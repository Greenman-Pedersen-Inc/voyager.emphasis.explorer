define([
    './app/Utilities.js',
    './app/ui/map/CrashDetails.js',
    './app/ui/map/Popup.js',
    "./app/staticData/filterItems/api.js",
    "./app/staticData/urls.js",

], function(Utilities, CrashDetails, Popup, api, urls) {
    function filterAttributes(feature, attributes) {
        let tableData = [];

        attributes.forEach(attr => {
            if (feature.properties.hasOwnProperty(attr)) {
                tableData[attr] = feature.properties[attr];
            }
        });

        return tableData;
    }

    function getFeatureDetails(crashIDArray, filterParameters) {
        let crashQuery = api.GetCrashDetailsQuery(filterParameters);

        if (crashIDArray.length > 0) {
            return fetch(crashQuery, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify(crashIDArray),
                })
                .then(response => response.json())
                .then(data => { return data })
                .catch(Utilities.errorHandler);
        } else {
            return Promise.resolve({
                features: []
            })
        }
    }

    return function MapSources(map) {
        const map_default = 7;
        const county_heatmap_zoomThreshold = 10;
        const muni_heatmap_zoomThreshold = 13;
        const layerDefinitions = {
            "county_heatmap": {
                type: 'vector',
                layers: [{
                    id: "county_heatmap_layer",
                    label: 'Crashes by County',
                    minzoom: 0,
                    maxzoom: county_heatmap_zoomThreshold,
                    type: 'fill',
                    source: "county_heatmap",
                    'source-layer': 'emphasis_areas_2021.lane_departure_crashes_cty',
                    'source-tiles': api.getCountyHeatmapQuery,
                    beforeLayer: "muni_heatmap_layer",
                    paintAttributes: {
                        //'fill-opacity': .8
                        'fill-opacity': [
                            'interpolate', ['linear'],
                            ['zoom'],
                            // When zoom is at default, layer will be 80% transparent.
                            map_default,
                            0.765,
                            // When zoom is at muni threshold or higher, layer will be 100% transparent.
                            county_heatmap_zoomThreshold,
                            0.25
                        ]
                    },
                    layout: {
                        'visibility': 'visible'
                    },
                    click: function(feature) {
                        return {
                            title: `${feature.properties.county.toTitleCase()} County`,
                            content: `${feature.properties.crashes.toLocaleString("en-US")} Crashes`
                        }
                    }
                }],
                legend: {
                    holder: 'county-legend-holder',
                    loading: 'county-legend-loading',
                    colorArray: ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'],
                    colorFill: ['interpolate', ['linear'],
                        ['get', 'crashes']
                    ],
                    countAttribute: 'crashes',
                    layer: 'county_heatmap_layer',
                    type: 'fill'
                }
            },
            "muni_heatmap": {
                type: 'vector',
                layers: [{
                    id: "muni_heatmap_layer",
                    label: 'Crashes by Municipality',
                    minzoom: county_heatmap_zoomThreshold,
                    maxzoom: muni_heatmap_zoomThreshold,
                    type: 'fill',
                    source: "muni_heatmap",
                    'source-layer': 'emphasis_areas_2021.lane_departure_crashes_muni',
                    'source-tiles': api.getMuniHeatmapQuery,
                    // beforeLayer: 'clusters',
                    paintAttributes: {
                        //'fill-opacity': .8
                        'fill-opacity': [
                            'interpolate', ['linear'],
                            ['zoom'],
                            // When zoom is at cty threshold, layer will be 80% transparent.
                            county_heatmap_zoomThreshold,
                            0.65,
                            // When zoom is at crash cluster threshold or higher, layer will be 100% transparent.
                            muni_heatmap_zoomThreshold,
                            .25
                        ]
                    },
                    layout: {
                        'visibility': 'visible'
                    },
                    click: function(feature) {
                        return {
                            title: feature.properties.mun.toTitleCase(),
                            description: `${feature.properties.county.toTitleCase()} County`,
                            content: `${feature.properties.crashes.toLocaleString("en-US")} Crashes`
                        }
                    }
                }],
                legend: {
                    holder: 'muni-legend-holder',
                    loading: 'muni-legend-loading',
                    colorArray: ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'],
                    colorFill: ['interpolate', ['linear'],
                        ['get', 'crashes']
                    ],
                    countAttribute: 'crashes',
                    layer: 'muni_heatmap_layer',
                    type: 'fill'
                }
            },
            "ard_accidents": {
                id: 'clusters',
                label: 'Crash Clusters',
                type: 'geojson',
                'source-layer': 'emphasis_areas_2021.lane_departure_crashes',
                'source-tiles': api.GetClusterHeatmapQuery,
                source: 'ard_accidents',
                cluster: true,
                clusterRadius: 80, // Radius of each cluster when clustering points (defaults to 50)
                explanation: {
                    id: "clusterInfo",
                    className: 'tooltipIconSmall statisticsTip',
                    text: 'The points are clustered by a predefined radius. <a style="color: lightgrey" target="_blank" href="https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson-cluster">source</a>'
                },
                minzoom: muni_heatmap_zoomThreshold,
                layers: [{
                        id: 'clusters',
                        label: 'Clusters',
                        minzoom: muni_heatmap_zoomThreshold,
                        type: 'circle',
                        source: 'ard_accidents',
                        'source-layer': 'emphasis_areas_2021.lane_departure_crashes',
                        'source-tiles': api.GetClusterHeatmapQuery,
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-radius': 15,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#707575'
                        },
                        layout: {
                            'visibility': 'visible'
                        },
                        beforeLayer: 'cluster-count',
                        click: function(feature, coordinates) {
                            const clusterSource = map.getSource('ard_accidents');


                            function getClusterLeavesPromise(sourceID, clusterID, limit, offset) {
                                return new Promise((resolve, reject) => {
                                    map.getSource(sourceID).getClusterLeaves(clusterID, limit, offset, (err, features) => {
                                        if (err) reject(err);
                                        else resolve(features);
                                    });
                                });
                            };

                            return getClusterLeavesPromise('ard_accidents', feature.id, feature.properties.point_count, 0).then(function(clusterFeatures) {
                                return getFeatureDetails(clusterFeatures.map(feature => feature.properties.crashid), map.filterParameters).then(detailedFeatureArray => {
                                    return {
                                        content: new CrashDetails(map, detailedFeatureArray).domNode
                                    }
                                })
                            });
                        }
                    },
                    {
                        id: 'cluster-count',
                        label: 'Cluster Count',
                        type: 'symbol',
                        source: 'ard_accidents',
                        'source-layer': 'emphasis_areas_2021.lane_departure_crashes',
                        'source-tiles': api.GetClusterHeatmapQuery,
                        minzoom: muni_heatmap_zoomThreshold,
                        filter: ['has', 'point_count'],
                        layout: {
                            'visibility': 'visible',
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12,
                        },
                    },
                    {
                        id: 'unclustered-point',
                        label: 'Single Crashes',
                        type: 'circle',
                        source: 'ard_accidents',
                        'source-layer': 'emphasis_areas_2021.lane_departure_crashes',
                        'source-tiles': api.GetClusterHeatmapQuery,
                        minzoom: muni_heatmap_zoomThreshold,
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-color': '#a1dbb2',
                            'circle-radius': 15,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#707575'
                        },
                        layout: {
                            'visibility': 'visible'
                        },
                        beforeLayer: 'uncluster-count',
                        click: function(feature) {
                            return getFeatureDetails([feature.properties.crashid], map.filterParameters).then(detailedFeatureArray => {
                                return {
                                    content: new CrashDetails(map, detailedFeatureArray).domNode
                                }
                            })
                        }
                    },
                    {
                        id: 'uncluster-count',
                        label: 'Cluster Count',
                        type: 'symbol',
                        source: 'ard_accidents',
                        'source-layer': 'emphasis_areas_2021.lane_departure_crashes',
                        'source-tiles': api.GetClusterHeatmapQuery,
                        minzoom: muni_heatmap_zoomThreshold,
                        filter: ['!', ['has', 'point_count']],
                        layout: {
                            'visibility': 'visible',
                            'text-field': '1',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12,
                        }
                    },
                ],
                legend: {
                    holder: 'clusters-legend-holder',
                    loading: 'clusters-legend-loading',
                    colorArray: ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'],
                    'circle-color': ['interpolate', ['linear'],
                        ['get', 'point_count']
                    ],
                    countAttribute: 'point_count',
                    layer: 'clusters',
                    type: 'circle'
                }
            },
            "ard_accidents_heatmap": {
                name: "ard_accidents_heatmap",
                type: 'geojson',
                layers: [{
                    id: 'point-heat',
                    minzoom: muni_heatmap_zoomThreshold,
                    type: 'heatmap',
                    sourceheatmap: 'ard_accidents_heatmap',
                    paint: {
                        // increase weight as diameter breast height increases
                        'heatmap-weight': {
                            property: 'dbh',
                            type: 'exponential',
                            stops: [
                                [1, 0],
                                [100, 1]
                            ]
                        },
                        // increase intensity as zoom level increases
                        'heatmap-intensity': {
                            stops: [
                                [11, 1],
                                [12, 3]
                            ]
                        },
                        // assign color values be applied to points depending on their density
                        'heatmap-color': [
                            'interpolate', ['linear'],
                            ['heatmap-density'],
                            0, "rgba(37, 52, 148, 0)",
                            0.2, "rgba(44, 127, 184, 1)",
                            0.4, "rgba(65, 182, 196, 1)",
                            0.5, "rgba(127, 205, 187, 1)",
                            0.6, "rgba(199, 233, 180, 1)",
                            1, "rgba(255, 255, 204, 1)"
                        ],
                        // increase radius as zoom increases
                        'heatmap-radius': {
                            stops: [
                                [9, 3],
                                [12, 25]
                            ]
                        },
                        // decrease opacity to transition into the circle layer
                        'heatmap-opacity': {
                            default: 1,
                            stops: [
                                [11, 1]
                            ]
                        },
                    }
                }]
            },
            "sri": {
                id: 'sri_crashes_points',
                name: "sri",
                label: 'Crashes Clustered by MP',
                type: 'geojson',
                sourceName: 'sri',
                type: 'geojson',
                // clusterRadius: 80, // Radius of each cluster when clustering points (defaults to 50)
                // cluster: true,
                layers: [{
                        id: "sri_crashes_points",
                        type: 'circle',
                        source: 'sri',
                        paint: {
                            // 'circle-color': '#a1dbb2',
                            'circle-radius': [
                                'step', ['zoom'],
                                3,
                                14,
                                5,
                                15.5,
                                10
                            ],
                            'circle-stroke-width': [
                                'step', ['zoom'],
                                1,
                                14,
                                1,
                                15.5,
                                2
                            ],
                            'circle-stroke-color': '#707575'
                        },
                        layout: {
                            'visibility': 'visible'
                        },
                        click: function(feature) {
                            if (feature) {
                                const sri = feature.properties.calc_sri;
                                const mp = feature.properties.calc_milepost;
                                const query = api.GetAccidentsBySriQuery(sri, mp, map.filterParameters);

                                function getSRICrashData(query) {
                                    return fetch(query).then(function(response) {
                                        return response.json();
                                    })
                                }

                                return getSRICrashData(query).then(function(crashData) {
                                    return {
                                        content: new CrashDetails(map, crashData.features.map(feature => feature.properties)).domNode
                                    }
                                });
                            }
                        }
                    },
                    {
                        id: 'sri_mp_label',
                        type: 'symbol',
                        source: 'sri',
                        layout: {
                            'visibility': 'visible',
                            'text-field': '{calc_milepost}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12,
                            'text-anchor': 'top',
                            'text-offset': [0, -3],
                            // 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                            // 'text-radial-offset': 3,
                        },
                        paint: {
                            'text-halo-width': 2
                        }
                    },
                    {
                        id: 'sri_crash_label',
                        type: 'symbol',
                        source: 'sri',
                        layout: {
                            'visibility': 'visible',
                            'text-field': '{crashes}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': [
                                'step', ['zoom'],
                                0,
                                14,
                                7,
                                15.5,
                                10
                            ],
                        }
                    }
                ],
                legend: {
                    holder: 'sri-legend-holder',
                    loading: 'sri-legend-loading',
                    colorArray: ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'],
                    'circle-color': ['interpolate', ['linear'],
                        ['get', 'crashes']
                    ],
                    countAttribute: 'crashes',
                    layer: 'sri_crashes_points',
                    type: 'circle'
                }
            }
        };

        var intersectionAttributes = ['SRI', 'SRI2', 'Milepost', 'MP', 'County', 'Town', 'MPO'];
        var corridorAttributes = ['Route', 'SRI', 'MP_Start', 'MP_End', 'County', 'Town', 'MPO'];
        var hrrrAttributes = ['Route', 'SRI', 'MP_Start', 'MP_End', 'County', 'Town', 'MPO'];
        var rsaAttributes = ['SRI', 'MP_Start', 'MP_Finish', 'Intersectio', 'Date', 'City'];
        var rsaAttributes_dvrpc = ['audit_date', 'audit_name', 'audit_type', 'pub_link', 'pub_num', 'county'];
        var equityAttributes = ['T_VULEOPCT', 'T_MINORPCT', 'T_LWINCPCT', 'T_LESHSPCT', 'T_LNGISPCT', 'T_UNDR5PCT', 'T_OVR64PCT'];

        var overlayLayers = {
            "equity_layer_demographic_index_percentile_src": {
                id: "Equity",
                label: "Equity Layer",
                layers: [{
                    id: "equity_layer",
                    label: "Demographic Index Percentile",
                    source: "DemographicIndex08_04_2021-7ozbwe",
                    url: "snopachinda.c1spchsk",
                    sourceType: "vector",
                    layerType: "fill",
                    dataAttributes: equityAttributes,
                    beforeLayer: "county_heatmap_layer",
                    paint: {
                        'fill-color': [
                            'step', ['get', 'Percentile'],
                            '#eceded', 50,
                            '#e1e2e2', 60,
                            '#d5d6d6', 70,
                            '#cacbcb', 80,
                            '#fafbdb', 90,
                            '#fae6bc', 95,
                            '#e2b0b0'
                        ],
                        'fill-opacity': 0.4,
                        'fill-outline-color': 'rgba(0, 0, 0, 0.375)'
                    },
                    legendEntries: [
                        { color: "#e2b0b0", label: "&#8805; 95%" },
                        { color: "#fae6bc", label: '< 95%' },
                        { color: "#fafbdb", label: '< 90%' },
                        { color: "#cacbcb", label: '< 80%' },
                        { color: "#d5d6d6", label: '< 70%' },
                        { color: "#e1e2e2", label: '< 60%' },
                        { color: "#eceded", label: '< 50%' },
                    ],
                    click: function(feature) {
                        return {
                            title: 'Equity Layer Info',
                            description: 'Current Population Survey Annual Social and Economic Supplements (CPS ASEC) conducted by the U.S. Census Bureau.',
                            table: feature.properties
                        }
                    }
                }]
            },
            "DVRPC": {
                id: "DVRPC",
                label: "DVRPC Layers",
                layers: [{
                        label: "Intersections",
                        layers: [{
                                id: "dvrpc_intersections_all",
                                label: "All",
                                source: "DVRPC_Intersection_Data-01ecay",
                                url: "snopachinda.113ax35h",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "county_heatmap_layer",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Intersection (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                }
                            },
                            {
                                id: "dvrpc_intersections_pedbike",
                                label: "Ped/Bike",
                                source: "DVRPC_Ped_Bike_Int_Data-3eb35l",
                                url: "snopachinda.aczu4s33",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "dvrpc_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Intersection (bikes & pedestrians)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                },
                            },
                            {
                                id: "dvrpc_intersections_ped",
                                label: "Ped",
                                source: "DVRPC_Pedestrian_Int_Data-6xxm46",
                                url: "snopachinda.3db044mz",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "dvrpc_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Intersection (pedestrians)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                },
                            },
                        ]
                    },
                    {
                        label: "Corridors",
                        layers: [{
                                id: "dvrpc_corridors_all",
                                label: "All",
                                source: "DVRPC_Corridor_Data-1gifl5",
                                url: "snopachinda.9zjxyhjl",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "dvrpc_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Corridor (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                },
                            },
                            {
                                id: "dvrpc_corridors_pedbike",
                                label: "Ped/Bike",
                                source: "DVRPC_Ped_Bike_Corridor_Data-ciqcjo",
                                url: "snopachinda.5o8qzju3",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "dvrpc_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Corridor (bike & pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                },
                            },
                            {
                                id: "dvrpc_corridors_ped",
                                label: "Ped",
                                source: "DVRPC_Ped_Corridor_Data-djocdr",
                                url: "snopachinda.3taq565i",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "dvrpc_intersections_ped",
                                click: function(feature) {
                                    return {
                                        title: 'DVRPC Corridor (pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                },
                            },
                        ]
                    },
                    {
                        id: "dvrpc_rsa",
                        label: "Road Safety Audits",
                        source: "DVRPC_Road_Safety_Audits_Edit-0i3azc",
                        url: "snopachinda.7s2uwd1e",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: rsaAttributes_dvrpc,
                        beforeLayer: "dvrpc_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'DVRPC Road Safety Audit',
                                description: `${feature.properties.audit_name}`,
                                table: filterAttributes(feature, rsaAttributes_dvrpc)
                            }
                        },
                    },
                    {
                        id: "dvrpc_hrrr",
                        label: "High Risk Rural Roads",
                        source: "DVRPC_HRRR_Data-awp5wr",
                        url: "snopachinda.57eh0bmb",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: hrrrAttributes,
                        beforeLayer: "dvrpc_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'DVRPC High Risk Rural Road',
                                description: `Crashes: ${feature.properties.Total_Cras}`,
                                table: filterAttributes(feature, hrrrAttributes)
                            }
                        },
                    }
                ]
            },
            "NJTPA": {
                id: "NJTPA",
                label: "NJTPA Layers",
                layers: [{
                        label: "Intersections",
                        layers: [{
                                id: "njtpa_intersections_all",
                                label: "All",
                                source: "NJTPA_Intersection_Data-7ov7d4",
                                url: "snopachinda.c7g125ma",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "county_heatmap_layer",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Intersection (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                },
                            },
                            {
                                id: "njtpa_intersections_pedbike",
                                label: "Ped/Bike",
                                source: "NJTPA_Ped_Bike_Int_Data-432o24",
                                url: "snopachinda.8s0kt5at",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "njtpa_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Intersection (bike & pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                },
                            },
                            {
                                id: "njtpa_intersections_ped",
                                label: "Ped",
                                source: "NJTPA_Pedestrian_Int_Data-do3js9",
                                url: "snopachinda.1q4da1fq",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "njtpa_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Intersection (pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                },
                            },
                        ]
                    },
                    {
                        label: "Corridors",
                        layers: [{
                                id: "njtpa_corridors_all",
                                label: "All",
                                source: "NJTPA_Corridor_Data-27yrxz",
                                url: "snopachinda.dz49l65n",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "njtpa_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Corridor (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                },
                            },
                            {
                                id: "njtpa_corridors_pedbike",
                                label: "Ped/Bike",
                                source: "NJTPA_Ped_Bike_Corridor_Data-4ww6hz",
                                url: "snopachinda.b259hol4",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "njtpa_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Corridor (bike & pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                },
                            },
                            {
                                id: "njtpa_corridors_ped",
                                label: "Ped",
                                source: "NJTPA_Pedestrian_Corridor_Dat-5evzo6",
                                url: "snopachinda.bcxoh5n8",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "njtpa_intersections_ped",
                                click: function(feature) {
                                    return {
                                        title: 'NJTPA Corridor (pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: "njtpa_rsa",
                        label: "Road Safety Audits",
                        source: "NJTPA_RSAs-3q9tqf",
                        url: "snopachinda.74wqhe74",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: rsaAttributes,
                        beforeLayer: "njtpa_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'NJTPA Road Safety Audit',
                                description: `${feature.properties.Intersecti || feature.properties.Name}`,
                                table: filterAttributes(feature, rsaAttributes)
                            }
                        }
                    },
                    {
                        id: "njtpa_hrrr",
                        label: "High Risk Rural Roads",
                        source: "NJTPA_HRRR_Data-8ujiju",
                        url: "snopachinda.2b611q8j",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: hrrrAttributes,
                        beforeLayer: "njtpa_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'NJTPA High Risk Rural Road',
                                description: `Crashes: ${feature.properties.Total_Cras}`,
                                table: filterAttributes(feature, hrrrAttributes)
                            }
                        }
                    }
                ]
            },
            "SJTPO": {
                id: "SJTPO",
                label: "SJTPO Layers",
                layers: [{
                        label: "Intersections",
                        layers: [{
                                id: "sjtpo_intersections_all",
                                label: "All",
                                source: "SJTPO_Intersection_Data-bnxt9m",
                                url: "snopachinda.4xw1guob",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: { 'circle-radius': 3, 'circle-stroke-width': 1, 'circle-stroke-color': '#2D3C48', 'circle-color': rcolor() },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "county_heatmap_layer",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Intersection (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                }
                            },
                            {
                                id: "sjtpo_intersections_pedbike",
                                label: "Ped/Bike",
                                source: "SJTPO_Ped_Bike_Int_Data-aourjn",
                                url: "snopachinda.6tzonrpg",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "sjtpo_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Intersection (bike & pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                }
                            },
                            {
                                id: "sjtpo_intersections_ped",
                                label: "Ped",
                                source: "SJTPO_Pedestrian_Int_Data-bpeg1j",
                                url: "snopachinda.dzj4abdv",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: {
                                    'circle-radius': 3,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#2D3C48',
                                    'circle-color': rcolor()
                                },
                                dataAttributes: intersectionAttributes,
                                beforeLayer: "sjtpo_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Intersection (pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, intersectionAttributes)
                                    }
                                }
                            },

                        ]
                    },
                    {
                        label: "Corridors",
                        layers: [{
                                id: "sjtpo_corridors_all",
                                label: "All",
                                source: "SJTPO_Corridor_Data-41cte3",
                                url: "snopachinda.cdl1pgpb",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "sjtpo_intersections_all",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Corridor (all)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                }
                            },
                            {
                                id: "sjtpo_corridors_pedbike",
                                label: "Ped/Bike",
                                source: "SJTPO_Ped_Bike_Corridor_Data-8hkcct",
                                url: "snopachinda.2392d9d2",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "sjtpo_intersections_pedbike",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Corridor (bike & pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                }
                            },
                            {
                                id: "sjtpo_corridors_ped",
                                label: "Ped",
                                source: "SJTPO_Pedestrian_Corridor_Dat-clkdti",
                                url: "snopachinda.32sxeqjs",
                                sourceType: "vector",
                                layerType: "line",
                                paint: {
                                    'line-width': 5,
                                    'line-color': rcolor()
                                },
                                dataAttributes: corridorAttributes,
                                beforeLayer: "sjtpo_intersections_ped",
                                click: function(feature) {
                                    return {
                                        title: 'SJTPO Corridor (pedestrian)',
                                        description: `Crashes: ${feature.properties.Total_Cras}`,
                                        table: filterAttributes(feature, corridorAttributes)
                                    }
                                }
                            },
                        ]
                    },
                    {
                        id: "sjtpo_rsa",
                        label: "Road Safety Audits",
                        source: "SJTPO_RSAs-5r4snq",
                        url: "snopachinda.2jfuom6g",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: rsaAttributes,
                        beforeLayer: "sjtpo_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'SJTPO Road Safety Audit',
                                description: `${feature.properties.Intersecti || feature.properties.Name}`,
                                table: filterAttributes(feature, rsaAttributes)
                            }
                        }
                    },
                    {
                        id: "sjtpo_hrrr",
                        label: "High Risk Rural Roads",
                        source: "SJTPO_HRRR_Data-66ilka",
                        url: "snopachinda.4zay69r9",
                        sourceType: "vector",
                        layerType: "line",
                        paint: {
                            'line-width': 5,
                            'line-color': rcolor()
                        },
                        dataAttributes: hrrrAttributes,
                        beforeLayer: "sjtpo_intersections_ped",
                        click: function(feature) {
                            return {
                                title: 'SJTPO High Risk Rural Road',
                                description: `Crashes: ${feature.properties.Total_Cras}`,
                                table: filterAttributes(feature, hrrrAttributes)
                            }
                        }
                    }
                ]
            }
        }

        this.jurisdictionLayerDefinitions = {
            'county': {
                'id': 'county_outline_layer',
                'type': 'line',
                'source': 'county_boundaries',
                'source-layer': 'county_boundaries_of_nj',
                'tileURL': urls.countyJurisdictionsURL,
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'rgba(0, 0, 0, 0.375)',
                    'line-width': [
                        'interpolate', ['linear'],
                        ['zoom'],
                        // When zoom is at cty threshold, lines will be 2px.
                        1,
                        0,
                        // When zoom is at crash cluster threshold or higher, lines will be thinner.
                        county_heatmap_zoomThreshold,
                        1
                    ]
                },
                maxzoom: county_heatmap_zoomThreshold,
                click: function(feature) {
                    return {
                        title: 'County Info',
                        description: 'Municipal information taken from <a href="https://gisdata-njdep.opendata.arcgis.com/">NJDEP Open Data.</a>',
                        table: feature.properties
                    }
                }
            },
            'municipality': {
                'id': 'municipality_outline_layer',
                'type': 'line',
                'source': 'municipality_boundaries',
                'source-layer': 'municipal_boundaries_of_nj',
                'tileURL': urls.municipalJurisdictionsURL,
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'rgba(0, 0, 0, 0.375)',
                    'line-width': [
                        'interpolate', ['linear'],
                        ['zoom'],
                        // When zoom is at cty threshold, lines will be 2px.
                        county_heatmap_zoomThreshold,
                        1,
                        // When zoom is at crash cluster threshold or higher, lines will be thinner.
                        muni_heatmap_zoomThreshold,
                        2
                    ]
                },
                minzoom: county_heatmap_zoomThreshold,
                // maxzoom: muni_heatmap_zoomThreshold,
                click: function(feature) {
                    return {
                        title: 'Municipal Info',
                        description: 'County information taken from <a href="https://gisdata-njdep.opendata.arcgis.com/">NJDEP Open Data.</a>',
                        table: feature.properties
                    }
                }
            }
        }

        this.getOverlayLayerDefinitions = function() {
            return overlayLayers;
        }

        this.getLayerDefinition = function(sourceString) {
            return layerDefinitions[sourceString];
        }

        this.getMapLayerData = function(layerName) {
            let layerData;

            function eachRecursive(layers, layerName) {
                layers.map(layer => {
                    if (layer.layers) {
                        eachRecursive(Object.values(layer.layers), layerName);
                    } else {
                        if (layer.id === layerName) {
                            layerData = layer;
                        }
                    }
                })
            }

            eachRecursive(Object.values(Object.assign(overlayLayers, layerDefinitions, self.jurisdictionLayerDefinitions)), layerName)

            return layerData;
        }

        this.getLayerGroupData = function (sourceString) {
            return layerDefinitions[sourceString];
        };
    
    }
});