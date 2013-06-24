WEBT = {};
WEBT.singlePage = (function() {
    $(function() {
        if (typeof(Storage) === "undefined") {
            alert("Sie brauchen einen Browser der Web Storage unterstützt um diese Anwendung zu nutzen.");
        }

        $.ajaxSetup({
            async: false
        });

        $('#register-button').click(register);
        $('#login-button').click(login);
        $('#logout-button').click(logout);
        $('#create-event-button').click(openCreateEventDialog);
        $('#create-event-dialog').dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            close: resetCreateEventDialog,
            buttons: {
                'Hinzufügen': function() {
                    var event = createNewEvent();
                    storeEvent(event);
                    $(this).dialog('close');
                    resetCreateEventDialog();
                    WEBT.localStorage.clearEvents();
                    resetEventsTable();
                    reloadEvents();
                    updateView();
                },
                'Abbrechen': function() {
                    $(this).dialog('close');
                    resetCreateEventDialog();
                }

            }});
        $('#view-event-dialog').dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            close: resetViewEventDialog,
            buttons: {
                'Schließen': function() {
                    resetViewEventDialog();
                    $(this).dialog('close');
                },
                'Teilnehmen': function() {
                    joinToEvent();
                    $(this).dialog('close');
                    WEBT.localStorage.clearEvents();
                    resetEventsTable();
                    reloadEvents();
                    updateView();
                }
            }
        });
        updateView();
    });


    var updateView = function() {
        if (typeof(localStorage.user) !== 'undefined') {
            $('#events').css('display', 'block');
            $('#login').css('display', 'none');
            resetEventsTable();
            setEventsTable();
        } else {
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
        resetError();
        var user = createUserFromLoginForm();
        WEBT.webStorage.login(user, finishLogin);

    };
    var finishLogin = function(result) {
        if (result.error === 'false') {
            var user = createUserFromLoginForm();
            WEBT.localStorage.storeUser(user);
        } else {
            setError(result.msg);
        }
        resetUserLoginForm();
        resetEventsTable();
        reloadEvents();
        updateView();
    };
    var reloadEvents = function() {
        WEBT.webStorage.listEvents(function(result) {
            if (result.error === 'false') {
                $.each(result.events, loadParticipationsToEachEvent);
            } else {
                setError(result.msg);
            }
        });
    };

    var loadParticipationsToEachEvent = function(i) {
        var event = this;
        event.participations = new Array();
        WEBT.webStorage.listUsersOfEvent(this, function(result) {
            if (result.error === 'false') {
                $.each(result.users, function(i) {
                    event.participations[i] = this;
                });
                WEBT.localStorage.storeEvent(event);
            } else {
                setError(result.msg);
            }
        });
    };
    var storeEvent = function(event) {
        WEBT.webStorage.create(event, function(result) {
            if (result.error === 'false') {
                event.eid = result.eid;
            } else {
                setError(result.msg);
            }
        });
    };

    var joinToEvent = function() {
        var eid = $('#event-eid').val();
        WEBT.webStorage.join(eid, function(result) {
            if (result.error === 'true') {
                setError(result.msg);
            }
        });
    };

    var resetUserLoginForm = function() {
        $('#userName').val('');
        $('#password').val('');
    };
    var createUserFromLoginForm = function() {
        var username = $('#username').val();
        var password = $('#password').val();
        return new WEBT.User(username, password);
    };
    var logout = function() {
        resetError();
        localStorage.clear();
        resetEventsTable();
        updateView();
    };
    var join = function() {
        resetError();
        var eid = $('#event-eid').val();
        WEBT.webStorage.join(eid, function(result) {
            if (result.error === 'false') {
                setError(result.msg);
            }
        });
    };
    var createNewEvent = function() {
        var event = new WEBT.Event();
        event.title = $('#event-title').val();
        event.date = $('#event-date').val();
        event.description = $('#event-description').val();
        return event;
    };

    var openCreateEventDialog = function() {
        resetError();
        $('#create-event-dialog').dialog('open');
    };



    var resetCreateEventDialog = function() {
        $('#event-title').val('');
        $('#event-date').val('');
        $('#event-description').val('');
    };

    var viewEvent = function(i) {
        resetError();
        var eventIndex = i.target.id.split("-")[2];
        var event = WEBT.localStorage.loadEvent(eventIndex);
        $('#event-eid').val(event.eid);
        $('#event-date-view').html(event.date);
        $('#event-title-view').html(event.title);
        $('#event-description-view').html(event.description);
        $.each(event.participations, function(i) {
            $('#view-event-participations').append('<li>' + this.name + '</li>');

        });
        $('#view-event-dialog').dialog('open');
    };

    var resetViewEventDialog = function() {
        $('#view-event-participations li').remove();
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

    var join = function(eid, callback) {
        $.getJSON('http://localhost/Events/ctrls/events.php', {
            operation: 'join',
            eid: eid

        },
        callback);
    };
    return {
        listEvents: listEvents,
        listUsersOfEvent: listUsersOfEvent,
        create: create,
        login: login,
        logout: logout,
        register: register,
        join: join
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

    var clear = function() {
        localStorage.clear();
    };

    var clearEvents = function() {
        if (typeof(localStorage.events) !== 'undefined') {
            localStorage.removeItem('events');
        }
    };

    return {
        storeUser: storeUser,
        loadUser: loadUser,
        loadEvents: loadEvents,
        loadEvent: loadEvent,
        storeEvent: storeEvent,
        storeEvents: storeEvents,
        clear: clear,
        clearEvents: clearEvents
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






