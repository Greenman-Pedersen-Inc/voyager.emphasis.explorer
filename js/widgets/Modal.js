define([

], function() {
    return function Modal(title = 'Error Information', text, redirect = false) {
        this.show = function () {
            modal.classList.add('open');
        };
    
        let modal = document.createElement('div');
        modal.className = 'modal fade bd-example-modal-sm show';
        modal.role = 'dialog';
        modal.style = 'display: block';
    
        let modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog modal-sm modal-dialog-centered';
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
        modalHeader.append(modalTitle);
    
        let modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalContent.appendChild(modalBody);
    
        let modalBodyText = document.createElement('p');
        modalBodyText.innerHTML = text;
        modalBody.appendChild(modalBodyText);
    
        let modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalContent.appendChild(modalFooter);
    
        let acceptButton = document.createElement('button');
        acceptButton.className = 'btn btn-primary';
        acceptButton.type = 'button';
        acceptButton.innerHTML = 'Accept';
        acceptButton.addEventListener('click', function (event) {
            if (redirect) {
                window.location = redirect;
            } else {
                modal.remove();
            }
        });
        modalFooter.appendChild(acceptButton);
    
        // modalOverlay.append(modal);
        document.body.style.display = 'block';
        document.body.prepend(modal);
    }
});