define([
    "./app/ui/map/MapSources.js",
    "./app/staticData/urls.js",
], function(
    MapSources, urls
) {
    return function JursidictionBoundaries(map) {
        let mapSources = new MapSources(map);

        this.addToMap = function() {
            Object.values(mapSources.jurisdictionLayerDefinitions).forEach(definition => {
                map.addSource(definition.source, {
                    type: 'vector',
                    tiles: [definition.tileURL]
                });
                map.addLayer(definition);
            })
        }

        Object.values(mapSources.jurisdictionLayerDefinitions).forEach(definition => {
            map.addSource(definition.source, {
                type: 'vector',
                tiles: [definition.tileURL]
            });
            map.addLayer(definition);
        })
    }
})