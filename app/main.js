require([
    './js/widgets/UserInfo.js',
    "./app/initiate.js",
    "dojo/domReady!"
], function (
    UserInfo,
    initiateHelper,
) {
    const baseURL = 'http://127.0.0.1:50000';
    var userInfo = new UserInfo(baseURL);
    userInfo
    .loadCredentials()
    .then(function() {
        userInfo.createUserActions().then(userControl => document.querySelector('#navbarNavDropdown ul').appendChild(userControl));
        initiateHelper.initiatePage(userInfo);
    })
    .catch((error) => {
        console.log(error);
    });    

});