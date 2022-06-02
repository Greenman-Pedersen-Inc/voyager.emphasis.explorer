require([
    './js/widgets/UserInfo.js',
    './app/staticData/urls.js',
    './app/initiate.js',
    'dojo/domReady!',
], function (UserInfo, urls, initiateHelper) {
    const baseURL = urls.adminURL;
    var userInfo = new UserInfo(baseURL);
    userInfo
        .loadCredentials()
        .then(function () {
            userInfo
                .createUserActions()
                .then((userControl) =>
                    document.querySelector('#navbarNavDropdown ul').appendChild(userControl)
                );
            initiateHelper.initiatePage(userInfo);
        })
        .catch((error) => {
            console.log(error);
        });
});
