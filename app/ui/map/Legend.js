define([
    "./app/ui/map/LegendCard.js",
    "./app/ui/map/LegendCardGroup.js"
], function(LegendCard, LegendCardGroup) {
    function dragElement(element, handle) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

            this.body.offsetWidth
            this.body.offsetHeight

            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            // set the element's new position:
            element.style.right = clamp(document.querySelector('#map').offsetWidth - (element.offsetWidth + element.offsetLeft) + pos1, 0, document.querySelector('#map').offsetWidth - element.offsetWidth) + "px";
            element.style.bottom = clamp(document.querySelector('#map').offsetHeight - (element.offsetHeight + element.offsetTop) + pos2, 0 - element.offsetHeight + handle.offsetHeight, document.querySelector('#map').offsetHeight - element.offsetHeight) + 'px';
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    return function Legend(map) {
        const self = this;

        this.legendCards = [];

        this.domNode = document.createElement('div');
        this.domNode.id = 'moveableLegend';

        let titleBlock = document.createElement('div');
        titleBlock.className = 'legendTitle';
        titleBlock.title = 'Legend';
        titleBlock.innerHTML = 'Legend';

        let titleCollapse = document.createElement('i');
        titleCollapse.className = 'bi bi-caret-down-square collapse-indicator';
        titleCollapse.style = 'position: relative; left: 80%; font-size: 1.125rem; cursor: pointer'
        titleCollapse.title = 'Collapse Legend';
        titleCollapse.addEventListener('click', function(event) {
            legendAccordion.classList.toggle('hidden');
            titleCollapse.classList.toggle('bi-caret-down-square');
            titleCollapse.classList.toggle('bi-caret-up-square');
            self.domNode.classList.toggle('collapsed');
        })
        titleBlock.append(titleCollapse);

        let content = document.createElement('div');
        content.className = 'legend';

        let legendAccordion = document.createElement('div');
        legendAccordion.id = 'legendAccordion';
        legendAccordion.className = 'accordion';

        this.domNode.append(titleBlock, content);
        content.append(legendAccordion);

        dragElement(this.domNode, titleBlock);

        this.clear = function() {
            while (legendAccordion.lastChild) {
                parent.removeChild(legendAccordion.lastChild);
            }
        }
        this.update = function() {
            let currentZoom = map.getZoom();

            self.legendCards.forEach(legendCard => {
                if (legendCard.updateVisibility) {
                    legendCard.updateVisibility(currentZoom);
                }
            })
        };
        this.addLayerGroup = function(legendGroup, visible = false, collapsed = true, stickTop = false) {
            const legendCardGroup = new LegendCardGroup(legendAccordion.id, map, legendGroup, visible, collapsed);

            stickTop ? legendAccordion.prepend(legendCardGroup.domNode) : legendAccordion.append(legendCardGroup.domNode);

            self.legendCards.push(legendCardGroup);

            return legendCardGroup;
        }
        this.addLayer = function(layerDefinition, features, visible = true, collapsed = false, legendVisibility = true, stickTop = false) {
            const legendCard = new LegendCard(legendAccordion.id, map, layerDefinition, features, visible, collapsed, legendVisibility);

            stickTop ? legendAccordion.prepend(legendCard.domNode) : legendAccordion.append(legendCard.domNode);

            self.legendCards.push(legendCard);

            return legendCard;
        }

        document.querySelector('#mapColumn .map-wrapper').append(this.domNode);
    }
})