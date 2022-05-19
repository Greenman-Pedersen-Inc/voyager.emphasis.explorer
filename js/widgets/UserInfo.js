define([
    "js/widgets/Modal.js",
], function(Modal) {
    return function UserInfo(baseURL, credentialName = 'safety_voyager_credential') {
        const self = this;
        const siteRootURL = '../login';
        const userModuleURL = `${baseURL}/admin/get-menu-info`;
        const authenticationURL = `${baseURL}/admin/authenticate`;
        const passwordResetURL = `${baseURL}/admin/reset-password`;
        const userNameURL = `${baseURL}/admin/get-full-name?`;
        const passwordUpdateURL = `${baseURL}/admin/update-password?`;
    
        const actions = [
            {
                label: 'logout',
                icon: "./img/sign-out-16.svg",
                action: function () {
                    localStorage.removeItem(credentialName);
                    window.location.href = siteRootURL;
                }
            }
        ];
    
        Object.defineProperty(this, 'username', {
            get: function () {
                return self._username;
            },
            set: function (value) {
                self._username = value;
            },
            enumerable: false
        });
        Storage.prototype.getObject = function (key) {
            var value = this.getItem(key);
            return value && JSON.parse(value);
        };
        Storage.prototype.setObject = function (key, value) {
            this.setItem(key, JSON.stringify(value));
        };
    
        this.getFullName = function () {
            return getData(userNameURL, { User: self.credentials.username });
        };
        this.getModules = function () {
            return getData(`${userModuleURL}/${self.credentials.username}`);
        };
        this.getNotifications = function () {
            return getData(userNotificationURL, { User: self.username });
        };
        this.submitCredentials = function (userId, userPass) {
            const credentials = { username: userId, pass: userPass };
    
            return postData(authenticationURL, credentials)
                .then(function (resolve, reject) {
                    if (resolve.tokenError) {
                        return Promise.reject(resolve);
                    } else {
                        storeCredentials(resolve[0].token, credentialName, window);
    
                        return Promise.resolve(JSON.parse(resolve[0].token));
                    }
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        };
        this.loadCredentials = function () {
            var idJson, idObject;
            if (supportsLocalStorage(window)) {
                // read from local storage
                idJson = window.localStorage.getItem(credentialName);
            } else {
                // read from a cookie
                idJson = cookie(credentialName);
            }
            if (idJson && idJson !== 'null' && idJson.length > 4) {
                idObject = JSON.parse(idJson);
                if (idObject.token) {
                    let timeToExpiration = idObject.expiration - Date.now();
    
                    if (timeToExpiration < 0) {
                        new Modal(
                            'Login Credentials Expired',
                            'You will be redirected to the login screen for authentication now.',
                            siteRootURL
                        ).show();
    
                        return Promise.reject('Login Credentials Expired');
                    } else {
                        // this timeout will automatically push the user back to the login at the
                        // expiration of their lease regardless of interaction.
                        setTimeout(() => {
                            new Modal(
                                'Login Credentials Expired',
                                'You will be redirected to the login screen for authentication now.',
                                siteRootURL
                            ).show();
                        }, timeToExpiration);
    
                        self.credentials = idObject;
                        return Promise.resolve(idObject);
                    }
                } else {
                    new Modal(
                        'Login Credentials Expired',
                        'You will be redirected to the login screen for authentication now.',
                        siteRootURL
                    ).show();
    
                    return Promise.reject('Login Credentials Expired');
                }
            } else {
                new Modal(
                    'Login Credentials Expired',
                    'You will be redirected to the login screen for authentication now.',
                    siteRootURL
                ).show();
    
                return Promise.reject('Login Credentials Expired');
            }
        };
        this.requestPasswordReset = function (username) {
            const credentials = { username: username };
    
            return postData(passwordResetURL, credentials)
                .then(function (response, reject) {
                    return Promise.resolve(response);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        };
        this.updatePassword = function (username, password) {
            let params = new URLSearchParams(document.location.search);
            let token = params.get('token');
            const credentials = {
                username: username,
                token: token,
                password: password
            };
    
            return postData(passwordUpdateURL, credentials)
                .then(function (response, reject) {
                    return Promise.resolve(response);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        };
        this.createUserActions = async function () {
            // return self.getFullName().then(function (fullName) {
            var fullName = await self.getFullName();
            var dropDownRoot = document.createElement('li');
            dropDownRoot.className = 'nav-item dropdown outline';
    
            var dropDownLink = document.createElement('a');
            dropDownLink.id = 'userName';
            dropDownLink.className = 'nav-link dropdown-toggle';
            dropDownLink.href = '#';
            dropDownLink.innerHTML = fullName.fullName || self.username || 'Welcome!';
            dropDownLink.setAttribute('data-bs-toggle', 'dropdown');
            dropDownLink.setAttribute('role', 'button');
            dropDownLink.setAttribute('data-toggle', 'dropdown');
            dropDownLink.setAttribute('aria-haspopup', 'true');
            dropDownLink.setAttribute('aria-expanded', 'false');
    
            var dropDownActions = document.createElement('div');
            dropDownActions.className = 'dropdown-menu dropdown-menu-end';
            dropDownActions.setAttribute('aria-labelledby', 'userName');
    
            actions.forEach(function (element) {
                var dropDownActionItem = document.createElement('a');
                dropDownActionItem.className = 'dropdown-item';
                dropDownActionItem.href = '#';
                dropDownActionItem.innerHTML = element.label;
                dropDownActionItem.title = element.label;
                dropDownActionItem.addEventListener('click', element.action);
    
                if (element.icon) {
                    var actionImage = document.createElement('img');
                    actionImage.className = 'action-image';
                    actionImage.src = element.icon;
    
                    dropDownActionItem.prepend(actionImage);
                }
    
                dropDownActions.appendChild(dropDownActionItem);
            });
    
            dropDownRoot.append(dropDownLink, dropDownActions);
    
            return dropDownRoot;
            // });
        };
        this.createUserMapTool = function () {
            return self.getFullName().then(function (fullName) {
                var userMapTool = document.createElement('div');
                userMapTool.className = 'userMapTool';
                userMapTool.title = 'User Map Tool';
    
                var userMapToggle = document.createElement('a');
                userMapToggle.className = 'toggle';
                userMapToggle.innerHTML = fullName.fullName;
                userMapToggle.addEventListener('click', function (event) {
                    userMapActions.classList.toggle('hidden');
                });
    
                var userMapActions = document.createElement('div');
                userMapActions.className = 'action-list hidden';
    
                actions.forEach(function (element) {
                    var dropDownActionItem = document.createElement('a');
                    dropDownActionItem.className = 'dropdown-item';
                    dropDownActionItem.href = '#';
                    dropDownActionItem.innerHTML = element.label;
                    dropDownActionItem.title = element.label;
                    dropDownActionItem.addEventListener('click', element.action);
    
                    if (element.icon) {
                        var actionImage = document.createElement('img');
                        actionImage.className = element.class;
    
                        dropDownActionItem.prepend(actionImage);
                    }
                    userMapActions.appendChild(dropDownActionItem);
                });
    
                userMapTool.appendChild(userMapToggle);
                userMapTool.appendChild(userMapActions);
    
                return userMapTool;
            });
        };
    
        function getData(url = '', filters = {}) {
            const searchParams = new URLSearchParams(filters);
            const dataURL = url + searchParams.toString();
            return fetch(dataURL, {
                headers: {
                    credentials: JSON.stringify(self.credentials)
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        return response.json().then((data) => {
                            return data;
                        });
                    } else {
                        console.log('issue with request', response);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    
        async function postData(url = '', data = {}) {
            // Default options are marked with *
            const response = await fetch(url, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            });
            return await response.json(); // parses JSON response into native JavaScript objects
        }
    
        function errorHandler(error) {
            console.error(error);
            if (error.httpCode === 498 || error.details.error.details.httpStatus === 498) {
                var redirectDialog = new Dialog({
                    title: 'Credentials Timed Out',
                    content:
                        'Your session has expired. In order to continue using Safety Voyager you must sign in again. Closing this dialog will redirect to the login where you will be able to sign in again.',
                    style: "width: 400px;  font-size: 14px; font-family: 'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif;",
                    closable: true,
                    onHide: function () {
                        redirectDialog.destroy();
                        window.location = loginURL;
                    }
                });
                redirectDialog.show();
            }
        }
        function storeCredentials(credentials, credentialName, window) {
            // make sure there are some credentials to persist
            const idString = credentials;
            // serialize the ID manager state to a string
            try {
                if (idString) {
                    // store it client side
                    if (supportsLocalStorage(window)) {
                        // use local storage
                        window.localStorage.setItem(credentialName, idString);
                    } else {
                        // use a cookie
                        cookie(credentialName, idString, { expires: 1 });
                        // console.log("wrote a cookie :-/");
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        function supportsLocalStorage() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }
    }
});