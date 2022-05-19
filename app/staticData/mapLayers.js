define([],
    function() {
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function randomColor(brightness) {
            function randomChannel(brightness) {
                var r = 255 - brightness;
                var n = 0 | ((Math.random() * r) + brightness);
                var s = n.toString(16);
                return (s.length == 1) ? '0' + s : s;
            }
            return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
        }

        var intersectionAttributes = ['SRI', 'SRI2', 'Milepost', 'MP', 'County', 'Town', 'MPO'];
        var corridorAttributes = ['Route', 'SRI', 'MP_Start', 'MP_End', 'County', 'Town', 'MPO'];
        var hrrrAttributes = ['Route', 'SRI', 'MP_Start', 'MP_End', 'County', 'Town', 'MPO'];
        var rsaAttributes = ['SRI', 'MP_Start', 'MP_Finish', 'Intersectio', 'Date', 'City'];
        var rsaAttributes_dvrpc = ['audit_date', 'audit_name', 'audit_type', 'pub_link', 'pub_num', 'county'];
        var equityAttributes = ['T_VULEOPCT', 'T_MINORPCT', 'T_LWINCPCT', 'T_LESHSPCT', 'T_LNGISPCT', 'T_UNDR5PCT', 'T_OVR64PCT'];

        var staticMapLayers = {
            "EquityLayer": {
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
                    beforeLayer: "county_outline_layer",
                    paint: {
                        'fill-color': [
                            'step', ['get', 'Percentile'],
                            '#eceded',
                            51,
                            '#e1e2e2',
                            61,
                            '#d5d6d6',
                            71,
                            '#cacbcb',
                            81,
                            '#fafbdb',
                            91,
                            '#fae6bc',
                            96,
                            '#e2b0b0'
                        ],
                        'fill-opacity': 0.4,
                        'fill-outline-color': 'rgba(0, 0, 0, 0.375)'
                    }
                }]
            },
            "DVRPC": {
                id: "DVRPC",
                label: "DVRPC Layers",
                layers: [

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
                                beforeLayer: "dvrpc_intersections_ped"
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
                                beforeLayer: "dvrpc_intersections_ped"
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
                                beforeLayer: "dvrpc_intersections_ped"
                            }
                        ]
                    },

                    {
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
                            }
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
                        beforeLayer: "dvrpc_intersections_ped"
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
                        beforeLayer: "dvrpc_intersections_ped"
                    }
                ]
            },
            "NJTPA": {
                id: "NJTPA",
                label: "NJTPA Layers",
                layers: [


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
                                beforeLayer: "njtpa_intersections_ped"
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
                                beforeLayer: "njtpa_intersections_ped"
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
                                beforeLayer: "njtpa_intersections_ped"
                            }
                        ]
                    },



                    {
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
                                dataAttributes: intersectionAttributes
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
                                dataAttributes: intersectionAttributes
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
                                dataAttributes: intersectionAttributes
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
                        beforeLayer: "njtpa_intersections_ped"
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
                        beforeLayer: "njtpa_intersections_ped"
                    }
                ]
            },
            "SJTPO": {
                id: "SJTPO",
                label: "SJTPO Layers",
                layers: [

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
                                beforeLayer: "sjtpo_intersections_ped"
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
                                beforeLayer: "sjtpo_intersections_ped"
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
                                beforeLayer: "sjtpo_intersections_ped"
                            },
                        ]
                    },


                    {
                        label: "Intersections",
                        layers: [{
                                id: "sjtpo_intersections_all",
                                label: "All",
                                source: "SJTPO_Intersection_Data-bnxt9m",
                                url: "snopachinda.4xw1guob",
                                sourceType: "vector",
                                layerType: "circle",
                                paint: { 'circle-radius': 3, 'circle-stroke-width': 1, 'circle-stroke-color': '#2D3C48', 'circle-color': rcolor() },
                                dataAttributes: intersectionAttributes
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
                                dataAttributes: intersectionAttributes
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
                                dataAttributes: intersectionAttributes
                            }
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
                        beforeLayer: "sjtpo_intersections_ped"
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
                        beforeLayer: "sjtpo_intersections_ped"
                    }
                ]
            }
        }

        function getStaticMapLayers() {
            return staticMapLayers;
        }

        return {
            getStaticMapLayers: getStaticMapLayers
        };
    });