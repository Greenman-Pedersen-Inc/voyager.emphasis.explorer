define([], function() {
    return function BasemapToggle(map) {
        const self = this;

        this.domNode = document.createElement('div');
        this.domNode.id = 'basemapToggleButton';
        this.domNode.className = 'btn satellite';
        this.domNode.title = 'Toggle between Line-Drawn Map and Satellite Imagery';
        this.domNode.innerHTML = '';
        this.domNode.addEventListener('click', function(event) {
            self.domNode.classList.toggle('streets');
            self.domNode.classList.toggle('satellite');

            if (self.domNode.classList.contains('satellite')) {
                map.setStyle('mapbox://styles/mapbox/streets-v11');
            } else {
                map.setStyle('mapbox://styles/mapbox/satellite-streets-v11');
            }
        });
    }
});