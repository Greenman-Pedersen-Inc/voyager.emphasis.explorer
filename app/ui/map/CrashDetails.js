define([
    './app/Utilities.js',
    './app/staticData/urls.js',
    "./app/staticData/filterItems/api.js",
    "./app/CodeTranslator.js",
    "./js/lib/gridjs.production.min.js",
], function(Utilities, urls, api, CodeTranslator, gridjs) {
    function GoogleMapsButton(feature) {
        var dirDegrees = 0; // North
        if (feature["veh_one_travel_dir_code"] === "04") {
            dirDegrees = 270;
        } else if (feature["veh_one_travel_dir_code"] === "03") {
            dirDegrees = 180;
        } else if (feature["veh_one_travel_dir_code"] === "02") {
            dirDegrees = 90;
        }

        this.button = document.createElement('a');
        this.button.id = 'googleMapsButton';
        this.button.type = 'button';
        this.button.className = 'btn btn-blue btn-sm';
        this.button.style = 'border: 1px solid grey; margin-right: 0.75em;'
        this.button.innerHTML = 'Street View';

        this.button.href = `https://maps.google.com/maps?q=&layer=c&cbll=${feature.calc_latitude},${feature.calc_longitude}&cbp=12,&{dirDegrees},0,0,0`;

        this.button.target = "_blank";
    }

    function PoliceFormButton(feature, filterParameters, credentials) {
        const self = this;
        const requestParams = {
            dlnNum: feature.dln,
        }

        this.domNode = document.createElement('a');
        this.domNode.id = 'policeFormButton';
        this.domNode.type = 'button';
        this.domNode.className = 'btn btn-blue btn-sm disabled';
        this.domNode.style = 'display: inline; border: 1px solid grey; margin-right: 0.75em;'
        this.domNode.innerHTML = 'View NJTR-1 Form';
        this.tippyInstance = new tippy(this.domNode, {
            content: 'This crash does not have an NJTR-1 form.',
            allowHTML: true,
            placement: 'right'
        });

        const reportUrlParams = Object.keys(requestParams).map(key => key + '=' + requestParams[key]).join('&');
        const headers = {
            headers: {
                token: credentials.token
            }
        }
        fetch(urls.crashRecordURL + reportUrlParams, headers)
            .then(response => {
                if (response.status === 200) {
                    response.json()
                        .then(data => {
                            if (data.url !== "") {
                                self.domNode.href = data.url;
                                self.domNode.target = "_blank";
                                self.domNode.classList.remove('disabled');
                                self.tippyInstance.disable();
                            }
                            else {
                                policeFormButton.button.classList.add('disabled');
                                policeFormButton.button.href = '';
                                tippyInstance.enable();
                            }
                        })
                }
                else {
                    self.domNode.classList.add('disabled');
                    self.domNode.href = '';
                    self.tippyInstance.enable();
                }
            })
            .catch(Utilities.errorHandler);
    }

    function FeatureGrid(feature) {
        this.domNode = document.createElement('div');
        this.domNode.style = 'overflow: hidden; border: 1px solid lightgrey; height: 24em;';

        let translatedFeatureProperties = new CodeTranslator.convertFeature(feature);

        let grid = new gridjs.Grid({
            columns: ["Field", "Value"],
            data: translatedFeatureProperties,
            width: "auto",
            style: {
                table: {
                    'border': 'none',
                },
                th: {
                    'padding': '0.5em',
                    'border-bottom': '1px solid lightgray'
                },
                td: {
                    'padding': '0.5em',
                    'border-bottom': '1px solid lightgray',
                    'width': '50%'
                }
            }
        }).render(this.domNode);

        this.update = function(feature) {
            let translatedFeatureProperties = CodeTranslator.convertFeature(feature);

            grid.updateConfig({ data: translatedFeatureProperties }).forceRender();
        }
    }

    return function CrashDetails(map, features, credentials) {
        const self = this;
        const headers = {
            headers: {
                token: credentials.token
            }
        }
        const headerContainer = document.createElement('div');
        const crashButtonContainer = document.createElement('div');
        const popupTitle = document.createElement('div');
        const googleMapsButton = new GoogleMapsButton(features[0]);
        const enumerationControls = document.createElement('div');
        const leftButton = document.createElement('a');
        const rightButton = document.createElement('a');
        const policeFormButton = new PoliceFormButton(features[0], map.filterParameters, credentials);
        // const closeButton = document.createElement('a');
        const gridContainer = document.createElement('div');
        const featureGrid = new FeatureGrid(features[0]);
        const enumerationControl = document.createElement('div');
        const indexLabelDiv = document.createElement('div');
        const indexLabel = document.createElement('div');

        this.domNode = document.createElement('div');
        this.index = 0
        this.features = features;
        this.domNode.style = 'overflow: hidden;';

        headerContainer.style = '';
        crashButtonContainer.style = 'display:inline-flex;';
        crashButtonContainer.className = 'mb-2';

        popupTitle.style = 'float: left; font-size: 1.25em; padding-bottom: 0.3em';
        popupTitle.innerHTML = `Crash ID: ${features[0].crashid}`
        enumerationControls.style = 'float: right;'

        leftButton.type = 'button';
        leftButton.className = 'btn btn-blue btn-sm';
        leftButton.style = 'border: 1px solid grey; border-radius: 3px 0 0 3px; display: inline;'
        leftButton.innerHTML = '<';
        leftButton.onclick = function(event) {
            const requestParams = {
                dlnNum: self.features[self.index].dln,
            }

            if (self.index === 0) {
                self.index = self.features.length - 1;
            } else {
                self.index -= 1;
            }

            indexLabel.innerHTML = `${self.index + 1} of ${self.features.length}`;
            featureGrid.update(self.features[self.index])
            popupTitle.innerHTML = `Crash ID: ${self.features[self.index].crashid}`
            googleMapsButton.button.href = `https://maps.google.com/maps?q=&layer=c&cbll=${self.features[self.index].calc_latitude},${self.features[self.index].calc_longitude}&cbp=12,&{dirDegrees},0,0,0`

            const reportUrlParams = Object.keys(requestParams).map(key => key + '=' + requestParams[key]).join('&');
            fetch(urls.crashRecordURL + reportUrlParams, headers)
                .then(response => {
                    if (response.status === 200) {
                        response.json()
                            .then(data => {
                                if (data.url !== "") {
                                    policeFormButton.domNode.href = data.url;
                                    policeFormButton.domNode.target = "_blank";
                                    policeFormButton.domNode.classList.remove('disabled');
                                    policeFormButton.tippyInstance.disable();
                                }
                                else {
                                    policeFormButton.domNode.classList.add('disabled');
                                    policeFormButton.domNode.href = '';
                                    policeFormButton.tippyInstance.enable();
                                }
                            })
                    }
                })
                .catch(Utilities.errorHandler);
        }

        indexLabelDiv.id = "indexlabeldiv";
        indexLabelDiv.style = 'display: inline-block; padding: 0 0.25em; font-size: 0.875 rem; line-height: 1.5; font-weight: bold;';
        indexLabel.style = 'text-align: center; width: 5.8em;'
        indexLabel.innerHTML = `${this.index + 1} of ${this.features.length}`;

        rightButton.type = 'button';
        rightButton.className = 'btn btn-blue btn-sm';
        rightButton.style = 'border: 1px solid grey; border-radius: 0 3px 3px 0; display: inline'
        rightButton.innerHTML = '>';
        rightButton.onclick = function(event) {
            const requestParams = {
                dlnNum: self.features[self.index].dln,
            }

            if (self.index === self.features.length - 1) {
                self.index = 0
            } else {
                self.index += 1;
            }
            indexLabel.innerHTML = `${self.index + 1} of ${self.features.length}`;
            featureGrid.update(self.features[self.index])
            popupTitle.innerHTML = `Crash ID: ${self.features[self.index].crashid}`
            googleMapsButton.button.href = `https://maps.google.com/maps?q=&layer=c&cbll=${self.features[self.index].calc_latitude},${self.features[self.index].calc_longitude}&cbp=12,&{dirDegrees},0,0,0`

            const reportUrlParams = Object.keys(requestParams).map(key => key + '=' + requestParams[key]).join('&');
            fetch(urls.crashRecordURL + reportUrlParams, headers)
                .then(response => {
                    if (response.status === 200) {
                        response.json()
                            .then(data => {
                                if (data.url !== "") {
                                    policeFormButton.domNode.href = data.url;
                                    policeFormButton.domNode.target = "_blank";
                                    policeFormButton.domNode.classList.remove('disabled');
                                    policeFormButton.tippyInstance.disable();
                                }
                                else {
                                    policeFormButton.domNode.classList.add('disabled');
                                    policeFormButton.domNode.href = '';
                                    policeFormButton.tippyInstance.enable();
                                }
                            })
                    }
                })
                .catch(errorHandler);
        }

        gridContainer.style = 'padding-bottom: 0.4em';

        // compile header components
        headerContainer.append(popupTitle);
        // headerContainer.append(popupTitle, closeButton);
        // compile crash detail functionality components
        indexLabelDiv.append(indexLabel);
        enumerationControl.append(leftButton, indexLabelDiv, rightButton);
        crashButtonContainer.append(googleMapsButton.button, policeFormButton.domNode, enumerationControl);
        // add the feature grid
        gridContainer.append(featureGrid.domNode);
        // take all major components and push them to the content container
        this.domNode.append(headerContainer, crashButtonContainer, gridContainer);

        if (self.features.length === 1) {
            leftButton.classList.add('disabled');
            rightButton.classList.add('disabled');
        }
    }
})