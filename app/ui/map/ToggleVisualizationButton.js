define([], function() {
    return function ToggleButton() {
        this.enableClickHandler = function(map) {
            var toggleVisualizationButton = document.getElementById('toggleVisualization');
            toggleVisualizationButton.onclick = function() {
                if (this.classList.contains('heat')) {
                    this.classList.remove('heat');
                    this.classList.add('circles');
                    if (map.getLayer('clusters')) {
                        map.setLayoutProperty('point-heat', 'visibility', 'visible');
                        map.setLayoutProperty('clusters', 'visibility', 'none');
                        map.setLayoutProperty('cluster-count', 'visibility', 'none');
                    }
                } else {
                    this.classList.add('heat');
                    this.classList.remove('circles');
                    if (map.getLayer('clusters')) {
                        map.setLayoutProperty('point-heat', 'visibility', 'none');
                        map.setLayoutProperty('clusters', 'visibility', 'visible');
                        map.setLayoutProperty('cluster-count', 'visibility', 'visible');
                    }
                }
            }
        }

        this.toggleButtonWorking = function(isWorking = true) {
            // var toggleVisualizationButton = document.getElementById('toggleVisualization');
            // if (isWorking) toggleVisualizationButton.classList.add('working');
            // else toggleVisualizationButton.classList.remove('working');
        }
    }
});