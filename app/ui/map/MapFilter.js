define([
    "./app/staticData/filterItems/api.js",
    "./app/staticData/filterItems/emphasisAreaSelections.js",

], function(api, emphasisAreaSelections) {
    return function MapFilter(map) {
        const self = this;

        this.map = map;
        this.directionFilters = [];
        this.hoursFilters = [];
        this.attributeFilters = [];
        this.mpoFilter = [];
        this.update = function(filterParameters, layerChanged = false) {
            if (layerChanged) {
                if (filterParameters.subCategory.value) {
                    catValue = filterParameters.subCategory.value;
                } else {
                    catValue = filterParameters.category.value;
                }
                var tableBase = emphasisAreaSelections.getTable(catValue);

                setLayerSource('county_heatmap_layer', 'county_heatmap', tableBase + '_crashes_cty');
                setLayerSource('muni_heatmap_layer', 'muni_heatmap', tableBase + '_crashes_muni');
            }

            var countyHeatMapQuery = api.GetCountyHeatmapQuery(filterParameters);
            var muniHeatMapQuery = api.GetMuniHeatmapQuery(filterParameters);

            // Set the tile url to a cache-busting url (to circumvent browser caching behaviour):
            self.map.getSource('county_heatmap').tiles = [countyHeatMapQuery.tileEndpoint + `&dt=${Date.now()}`];
            self.map.getSource('muni_heatmap').tiles = [muniHeatMapQuery.tileEndpoint + `&dt=${Date.now()}`];

            // Remove the tiles for a particular source
            self.map.style._sourceCaches['other:county_heatmap'].clearTiles();
            self.map.style._sourceCaches['other:muni_heatmap'].clearTiles();
            // Load the new tiles for the current viewport (map.transform -> viewport)
            self.map.style._sourceCaches['other:county_heatmap'].update(map.transform);
            self.map.style._sourceCaches['other:muni_heatmap'].update(map.transform);

            // Force a repaint, so that the map will be repainted without you having to touch the map
            self.map.triggerRepaint();
        }

        this.getCurrentFilter = function(inputFilter) {
            var filterArray = ['all'];

            filterArray.push(inputFilter);

            // populate the filter statements with values from menu
            // filterArray.push(updateDirectionFilters());
            // filterArray.push(updateHourFilters());
            // filterArray.push(updateAttributeFilters());
            filterArray.push(updateSRIFilter());
            filterArray.push(updateJurisdictionFilter());
            filterArray.push(updateYearFilter());

            return filterArray.filter(n => n !== undefined);
        }

        function updateSRIFilter() {
            let sriPicker = document.getElementById('sriPicker');

            if (sriPicker.value && !sriPicker.getAttribute('disabled')) {
                return ['==', sriPicker.value, ['get', 'calc_sri']];
            }
        }

        function updateJurisdictionFilter() {
            var muniFilter = ['all'];

            let countyPicker = document.getElementById('countyPicker');
            let muniPicker = document.getElementById('muniPicker');
            let mpoRadioOption = document.getElementById('mpo-summary');
            let mpoPicker = document.getElementById('mpoPicker');

            // check if the MPO option was selected. Else, check if county or muni was selected
            if (mpoRadioOption.checked && mpoPicker.value) {
                var mpoSelectValue = mpoPicker.value;
                var countiesSelected = mpoSelectValue.split(",");

                if (countiesSelected.length > 0) {
                    return ['in', ['get', 'mun_cty_co'],
                        ['literal', countiesSelected]
                    ];
                }
            } else {
                if (muniPicker.value && !muniPicker.getAttribute('disabled') && countyPicker.value && !countyPicker.getAttribute('disabled')) {
                    muniFilter.push(['==', muniPicker.value.slice(2), ['get', 'mun_mu']]);
                    muniFilter.push(['==', countyPicker.value, ['get', 'mun_cty_co']]);
                    return muniFilter;
                } else if (countyPicker.value && !countyPicker.getAttribute('disabled')) {
                    return ['==', countyPicker.value, ['get', 'mun_cty_co']];
                } else {
                    // console.log('no jurisdiction selected');
                }
            }
        }

        function updateYearFilter() {
            let startYearPicker = document.getElementById('startYearPicker')
            let endYearPicker = document.getElementById('endYearPicker')
            let yearFilter = ['all'];

            yearFilter.push(['>=', ['get', 'year'], parseInt(startYearPicker.value)]);
            yearFilter.push(['<=', ['get', 'year'], parseInt(endYearPicker.value)]);

            return yearFilter;
        }

        function setLayerSource(layerId, source, sourceLayer) {
            const oldLayers = map.getStyle().layers;
            const layerIndex = oldLayers.findIndex(l => l.id === layerId);
            const layerDef = oldLayers[layerIndex];
            if (sourceLayer) {
                map.getLayer(layerDef.id).source = source;
                map.getLayer(layerDef.id).sourceLayer = sourceLayer;
            }
        }
    }
})