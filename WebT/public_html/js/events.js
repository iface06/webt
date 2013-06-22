WEBT = {};
WEBT.singlePage = (function() {
    $(function() {
        if (typeof(Storage) === "undefined") {
            alert("Sie brauchen einen Browser der Web Storage unterstützt um diese Anwendung zu nutzen.");
        }

        $('#login-button').click(login);
        $('#logout-button').click(logout);
        updateView();
    });


    var updateView = function() {
        if (typeof(localStorage.user) !== 'undefined') {
            $('#event-manager').css('display', 'block');
            $('#logout-button').css('display', 'block');
            $('#login').css('display', 'none');
            showEvents();
        } else {
            $('#logout-button').css('display', 'none');
            $('#event-manager').css('display', 'none');
            $('#login').css('display', 'block');
        }
    };

    var login = function() {
        var username = $('#username').val();
        var password = $('#password').val();
        WEBT.localStorage.storeUser(new WEBT.User(username, password));
        $('#userName').val('');
        $('#password').val('');
        updateView();
    };
    
    var logout = function(){
        localStorage.clear();
        updateView();
    };
    
    var showEvents = function(){
        
    };
    
    return {
        updateView: updateView
    };
}());

WEBT.localStorage = (function(){
    
    var storeUser = function(user){
        localStorage.user = JSON.stringify(user);
    };
    
    var loadUser = function(){
        if(typeof(localStorage.user) !== 'undefined')
            return JSON.parse(localStorage.user);
    };
    
    return {
        storeUser: storeUser,
        loadUser: loadUser
    };
})();

WEBT.User = function(username, password) {
    this.userName = username;
    this.password = password;

}






