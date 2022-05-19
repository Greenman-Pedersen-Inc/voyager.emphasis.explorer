define(function() {
    return function DataTable(containerDiv, buttonDiv, dataTableOptions, mapButton, map, mapFilter) {
        var self = this;
        this.data = dataTableOptions.data;

        function createFilterFromData(data) {
            var jointRouteFilter = ['any'];

            data.forEach(function(element) {
                var routeFilter = ['all'];
                var mpRange = element.Mp_Range.split(' ');
                let minMP = parseFloat(mpRange[0]);
                let maxMP = parseFloat(mpRange[mpRange.length - 1]);

                routeFilter.push(['==', element.Sri, ['get', 'calc_sri']]);
                routeFilter.push(['>=', ['get', 'calc_milepost'], minMP]);
                routeFilter.push(['<=', ['get', 'calc_milepost'], maxMP]);

                jointRouteFilter.push(routeFilter);
            });

            return jointRouteFilter;
        }

        function filterByTableData(element) {
            let elementMP = parseFloat(element.properties.milepost);
            let elementSRI = element.properties.sri;

            if (self.data) {
                for (var i = 0; i < self.data.length; i++) {
                    let listEntry = self.data[i];
                    let mpRange = listEntry.Mp_Range.split(' ');
                    let minMP = parseFloat(mpRange[0]);
                    let maxMP = parseFloat(mpRange[mpRange.length - 1]);

                    if (listEntry.Sri === elementSRI) {
                        if (elementMP >= minMP) {
                            if (elementMP <= maxMP) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            } else { return false; }
        }

        if (mapButton) {
            mapButton.addEventListener('click', function(event) {
                var tableFilters = createFilterFromData(self.data);
                var mapFilters = mapFilter.getCurrentFilter(tableFilters);
                // var toggleVisualizationButton = document.getElementById('toggleVisualization');

                map.setFilter('points', mapFilters);
                map.setFilter('arrows', mapFilters);
                map.setFilter('point-heat', mapFilters);

                // toggleVisualizationButton.classList.add('heat');
                // toggleVisualizationButton.classList.remove('circles');
                map.setLayoutProperty('points', 'visibility', 'visible');
                map.setLayoutProperty('point-heat', 'visibility', 'none');

                document.getElementById('MapPill').click();

                map.flyTo({
                    center: [-74.53682654780151, 40.08820519710642],
                    zoom: 7.5,
                });
            })
        }

        this.update = function(updateData) {
            self.table.clear();
            self.data = updateData;
            self.table.rows.add(updateData);
            self.table.columns.adjust().draw();
        }

        this.table = $(containerDiv).DataTable(dataTableOptions);
        if (dataTableOptions.buttons) {
            this.table.buttons().container()
                .appendTo($(buttonDiv, this.table.table().container()));
        }
        this.table.columns.adjust().draw();
    }
});