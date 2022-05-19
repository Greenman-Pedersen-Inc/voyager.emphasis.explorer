require([
    '../js/widgets/UserInfo.js',
    "./app/initiate.js",
    "dojo/domReady!"
], function (
    UserInfo,
    initiateHelper,
) {
    var userInfo = new UserInfo(true);
    userInfo.createUserActions().then(userControl => document.querySelector('#navbarNavDropdown ul').appendChild(userControl));
    
    initiateHelper.initiatePage();
});