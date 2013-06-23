WEBT = {};
WEBT.singlePage = (function() {
    $(function() {
        if (typeof(Storage) === "undefined") {
            alert("Sie brauchen einen Browser der Web Storage unterstützt um diese Anwendung zu nutzen.");
        }

        $('#register-button').click(register);
        $('#login-button').click(login);
        $('#logout-button').click(logout);
        $('#store-events-button').click(storeEvents);
        $('#create-event-button').click(createNewEvent);
        $('#create-event-dialog').dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                'Hinzufügen': function() {
                    var event = new WEBT.Event();
                    event.title = $('#event-title').val();
                    event.date = $('#event-date').val();
                    event.description = $('#event-description').val();
                    WEBT.localStorage.storeEvent(event);
                    $(this).dialog('close');
                    $('#event-title').val('');
                    $('#event-date').val('');
                    $('#event-description').val('');
                    updateView();
                },
                'Abbrechen': function() {
                    $(this).dialog('close');
                }

            }});
        $('#view-event-dialog').dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                'Schließen': function() {
                    $(this).dialog('close');
                },
                'Teilnehmen': function() {
                    joinToEvent();
                    $(this).dialog('close');
                }
            }
        });
        updateView();
    });
    var updateView = function() {
        if (typeof(localStorage.user) !== 'undefined') {
            $('#events').css('display', 'block');
            $('#logout-button').css('display', 'block');
            $('#login').css('display', 'none');
            resetEventsTable();
            setEventsTable();
        } else {
            $('#logout-button').css('display', 'none');
            $('#events').css('display', 'none');
            $('#login').css('display', 'block');
        }
    };
    var setError = function(errorMessage) {
        $('#error-message').html(errorMessage);
        $('#error').css('display', 'block');
    };
    var resetError = function() {
        $('#error-message').html('');
        $('#error').css('display', 'none');
    };
    var register = function() {
        var user = createUserFromLoginForm();
        WEBT.webStorage.register(user, loginAfterSuccessfulRegistration);
    };
    var loginAfterSuccessfulRegistration = function(result) {
        if (result.error === 'false') {
            var user = createUserFromLoginForm();
            WEBT.webStorage.login(user, finishLogin);
        } else {
            setError(result.msg);
        }
    };
    var login = function() {
        var user = createUserFromLoginForm();
        WEBT.webStorage.login(user, finishLogin);
    };
    var finishLogin = function(result) {
        if (result.error === 'false') {
            var user = createUserFromLoginForm();
            WEBT.localStorage.storeUser(user);
            resetUserLoginForm();
            reloadEvents();
            updateView();
        } else {
            setError(result.msg);
        }
    };
    var reloadEvents = function() {
        WEBT.webStorage.listEvents(function(result) {
            if (result.error === 'false') {
                $.each(result.events, function(i) {
                    var event = this;
                    event.participations = new Array();
                    WEBT.webStorage.listUsersOfEvent(this, function(result) {
                        if (result.error === 'false') {
                            $.each(result.users, function(i) {
                                event.participations[i] = this;
                            });
                        } else {
                            setError(result.msg);
                        }
                    });
                });
                WEBT.localStorage.storeEvents(result.events);
                updateView();
            } else {
                setError(result.msg);
            }
        });
    };
    var storeEvents = function() {
        var events = WEBT.localStorage.loadEvents();
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            WEBT.webStorage.create(events[i], function(result) {
                if (result.error === 'true') {
                    setError(result.msg);
                } else {
                    event.eid = result.eid;
                }
            });
        }
    };
    resetUserLoginForm = function() {
        $('#userName').val('');
        $('#password').val('');
    };
    var createUserFromLoginForm = function() {
        var username = $('#username').val();
        var password = $('#password').val();
        return new WEBT.User(username, password);
    };
    var logout = function() {
        localStorage.clear();
        resetEventsTable();
        updateView();
    };
    var join = function() {
        var eid = $('#event-eid').val();
        WEBT.webStorage.join(eid, function(result) {
            if (result.error === 'false') {

            }
        });
    };
    var createNewEvent = function() {
        $('#create-event-dialog').dialog('open');
    };
    var viewEvent = function(i) {
        var eventIndex = i.target.id.split("-")[2];
        var event = WEBT.localStorage.loadEvent(eventIndex);
        $('#event-date-view').html(event.date);
        $('#event-title-view').html(event.title);
        $('#event-description-view').html(event.description);
        $.each(event.participations, function(i) {
            $('#view-event-participations').append('<li>' + this.name + '</li>');

        });
        $('#view-event-dialog').dialog('open');
    };
    var setEventsTable = function() {
        var events = WEBT.localStorage.loadEvents();
        var eventsTable = $('#events-table tbody');
        $.each(events, function(i) {
            var row = "<tr><td><input class=\"ui-icon ui-icon-search open\" type=\"button\" id=\"view-event-" + i + "\"></td><td>" + this.date + "</td><td>" + this.title + "</td><td>" + this.description + "</td></tr>";
            eventsTable.append(row);
            $(('#view-event-' + i)).click(viewEvent);
        });
    };
    var resetEventsTable = function() {
        $('#events-table tbody tr').remove();
    };
    return {
        updateView: updateView
    };
}());
WEBT.webStorage = (function() {
    var listEvents = function(callback) {
        $.getJSON('http://localhost/Events/ctrls/events.php', {
            operation: 'list_events'
        },
        callback);
    };
    var listUsersOfEvent = function(event, callback) {
        $.getJSON('http://localhost/Events/ctrls/events.php', {
            operation: 'list_users_of_event',
            eid: event.eid
        },
        callback);
    };
    var create = function(event, callback) {
        $.getJSON('http://localhost/Events/ctrls/events.php', {
            operation: 'create',
            title: event.title,
            description: event.description,
            date: event.date
        },
        callback);
    };
    var register = function(user, callback) {
        $.getJSON('http://localhost/Events/ctrls/users.php', {
            operation: 'register',
            name: user.name,
            password: user.password
        },
        callback);
    };
    var login = function(user, callback) {
        $.getJSON('http://localhost/Events/ctrls/users.php', {
            operation: 'login',
            name: user.name,
            password: user.password
        },
        callback);
    };
    var logout = function(user, callback) {
        $.getJSON('http://localhost/Events/ctrls/users.php', {
            operation: 'logout'
        },
        callback);
    };
    return {
        listEvents: listEvents,
        listUsersOfEvent: listUsersOfEvent,
        create: create,
        login: login,
        logout: logout,
        register: register
    };
})();
WEBT.localStorage = (function() {

    var storeUser = function(user) {
        localStorage.user = JSON.stringify(user);
    };
    var loadUser = function() {
        if (typeof(localStorage.user) !== 'undefined')
            return JSON.parse(localStorage.user);
    };
    var storeEvents = function(events) {
        var eventsAsJson = JSON.stringify(events);
        localStorage.events = eventsAsJson;
    };
    var loadEvents = function() {
        if (typeof(localStorage.events) !== 'undefined')
            return JSON.parse(localStorage.events);
        else
            return new Array();
    };
    var loadEvent = function(i) {
        var events = loadEvents();
        if (i < events.length) {
            return events[i];
        }
        return new WEBT.Event();
    };
    var storeEvent = function(event) {
        var events = new Array();
        var i = 0;
        if (typeof(localStorage.events) !== 'undefined') {
            events = JSON.parse(localStorage.events);
            i = events.length;
        }

        events[i] = event;
        storeEvents(events);
    };
    return {
        storeUser: storeUser,
        loadUser: loadUser,
        loadEvents: loadEvents,
        loadEvent: loadEvent,
        storeEvent: storeEvent,
        storeEvents: storeEvents
    };
})();
WEBT.User = function(username, password) {
    this.name = username;
    this.password = password;
};
WEBT.Event = function() {
    this.title;
    this.date;
    this.description;
    this.eid;
    this.uid;
    this.participations = new Array();
};






