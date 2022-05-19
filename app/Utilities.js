define([], function() {
    function createModal(text, title = 'Error Information', redirect = false) {
        let modal = document.createElement('div');
        modal.className = 'modal';
        modal.tabindex = '-1';
        modal.role = 'dialog';

        let modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog';
        modalDialog.role = 'document';
        modal.appendChild(modalDialog);

        let modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalDialog.appendChild(modalContent);

        let modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalContent.appendChild(modalHeader);

        let modalTitle = document.createElement('h5');
        modalTitle.className = 'modal-title';
        modalTitle.innerHTML = title;
        modalTitle.title = title;

        let closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.setAttribute('data-dismiss', 'modal');
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.addEventListener('click', function(event) {
            if (redirect) {
                window.location = siteRootURL;
            } else {
                modal.remove();
            }
        });
        modalHeader.append(modalTitle, closeButton);

        let hiddenSpan = document.createElement('span');
        hiddenSpan.setAttribute('aria-hidden', 'true');
        hiddenSpan.innerHTML = '&times';
        closeButton.appendChild(hiddenSpan);

        let modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalContent.appendChild(modalBody);

        let modalBodyText = document.createElement('p');
        modalBodyText.innerHTML = text;
        modalBody.appendChild(modalBodyText);

        let modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalContent.appendChild(modalBody);

        let acceptButton = document.createElement('button');
        acceptButton.className = 'btn btn-primary';
        acceptButton.type = 'button'
        acceptButton.addEventListener('click', function(event) {
            if (redirect) {
                window.location = siteRootURL;
            } else {
                modal.remove();
            }
        });
        modalFooter.appendChild(acceptButton);

        document.appendChild(modal);
    }

    function errorHandler(error, message) {
        if (error.httpCode === 498) {
            createModal('Your session has expired. In order to continue using Safety Voyager you must sign in again. Closing this dialog will redirect to the login where you will be able to sign in again.', 'Credentials Timed Out', true)
        } else if (error.name === 'identity-manager:aborted') {
            createModal('Your session has expired. In order to continue using Safety Voyager you must sign in again. Closing this dialog will redirect to the login where you will be able to sign in again.', 'Credentials Timed Out', true)
        } else if (error.details) {
            if (error.details.error) {
                if (error.details.error.details) {
                    if (error.details.error.details.httpStatus === 498) {
                        createModal('Your session has expired. In order to continue using Safety Voyager you must sign in again. Closing this dialog will redirect to the login where you will be able to sign in again.', 'Credentials Timed Out', true)
                    } else {
                        createModal(error);
                    }
                }
            } else {
                createModal(error);
            }
        } else {
            createModal(error);
        }
    }

    function evaluateZoomVisibility(zoomLevel, minzoom, maxzoom) {
        if (minzoom && maxzoom) {
            if (zoomLevel >= minzoom && zoomLevel <= maxzoom) {
                return true;
            } else {
                return false;
            }
        } else if (minzoom) {
            if (zoomLevel >= minzoom) {
                return true;
            } else {
                return false;
            }
        } else if (maxzoom) {
            if (zoomLevel <= maxzoom) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    String.prototype.toTitleCase = function() {
        return this.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    };

    return {
        errorHandler: errorHandler,
        evaluateZoomVisibility: evaluateZoomVisibility
    }
})