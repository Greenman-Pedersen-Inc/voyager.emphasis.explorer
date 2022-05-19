define(["./app/components/popup/PopupGrid.js"], function(PopupGrid) {
    function createContent(feature) {
        let content = document.createElement('div');
        let loading = document.createElement('div');
        loading.className = 'loading';

        Promise.resolve(feature).then(function(resolvedFeature) {
            loading.classList.add('hidden');

            if (resolvedFeature.title) {
                let header = document.createElement('div');
                header.className = 'popup-header';
                header.innerHTML = resolvedFeature.title;
                header.title = resolvedFeature.title;
                content.append(header);
            }

            if (resolvedFeature.description) {
                let subheader = document.createElement('div');
                subheader.className = 'popup-subheader';
                subheader.innerHTML = resolvedFeature.description;
                content.append(subheader);
            }

            if (resolvedFeature.content) {
                let body = document.createElement('div');
                body.className = 'popup-body';
                body.append(resolvedFeature.content);
                content.append(body);
            }

            if (resolvedFeature.table) {
                let cols = ['Field', 'Value'];
                let classNames = {
                    td: 'layer-popup-td',
                    th: 'layer-popup-th',
                    table: 'layer-popup-font layer-popup-table'
                };
                let popupTable = new PopupGrid(cols, resolvedFeature.table, classNames);

                content.append(popupTable.domNode);
            }
        })

        content.append(loading);

        return content;
    }


    return function Popup(map, coordinates, features, refreshHandler) {
        const self = this;
        let domNode = document.createElement('div');
        let body = document.createElement('div');

        domNode.append(body);

        if (features && features.length) {
            let featureIndex = 0;
            let content = createContent(features[0]);
            let footer = document.createElement('div');
            footer.className = 'popup-footer';

            let previousFeature = document.createElement('i');
            previousFeature.className = 'bi bi-caret-left-square';
            previousFeature.addEventListener('click', function(event) {
                body.innerHTML = '';

                if (featureIndex === 0) {
                    featureIndex = features.length - 1;
                } else {
                    featureIndex--;
                }

                featureCount.innerHTML = `${featureIndex + 1} of ${features.length}`;
                content = createContent(features[featureIndex]);
                body.append(content);
            })

            let featureCount = document.createElement('div');
            featureCount.className = 'feature-count';
            featureCount.innerHTML = `1 of ${features.length}`;

            let nextFeature = document.createElement('div');
            nextFeature.className = 'bi bi-caret-right-square';
            nextFeature.addEventListener('click', function(event) {
                body.innerHTML = '';

                if (featureIndex === features.length - 1) {
                    featureIndex = 0;
                } else {
                    featureIndex++;
                }

                featureCount.innerHTML = `${featureIndex + 1} of ${features.length}`;
                content = createContent(features[featureIndex]);
                body.append(content);
            })

            let spacerDiv = document.createElement('div');
            spacerDiv.style = 'padding: 0.25rem'

            footer.append(previousFeature, featureCount, nextFeature);
            body.append(content);
            features.length > 1 ? domNode.append(footer) : domNode.append(spacerDiv);





            // county and muni heatmap popup
            let popup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                    closeOnMove: false,
                    className: 'mapboxgl-heatmap-popup'
                }).setLngLat(coordinates)
                .setDOMContent(domNode)
                .addTo(map);

            popup.on('close', function(event) {
                refreshHandler();
                map.on('zoomend', refreshHandler);
                map.on('moveend', refreshHandler);
            });
        }
    }
});