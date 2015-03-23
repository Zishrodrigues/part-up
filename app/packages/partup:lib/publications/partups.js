Meteor.publish('partups.all', function () {
    return Partups.find({});
});

Meteor.publish('partups.recent', function () {
    return Partups.find({}, {sort: {createdAt: -1}, limit: 3});
});

Meteor.publish('partups.supported', function () {
    return Partups.find({});
});

Meteor.publish('partups.detail', function (partupId) {
    var subscription = this;
    var partupHandle = null;
    var uppersHandle = [];
    var supportersHandle = [];
    var activitiesHandle = [];

    partupHandle = Partups.find({ _id: partupId }).observeChanges({
        added: function(id, partup) {
            // Publish all Uppers in a Partup
            var uppers = partup.uppers || [];
            var uppersCursor = Meteor.users.find({ _id: { $in: uppers }});
            uppersHandle[id] = Meteor.Collection._publishCursor(uppersCursor, subscription, 'users');

            // Publish all Supporters in a Partup
            var supporters = partup.supporters || [];
            var supportersCursor = Meteor.users.find({ _id: { $in: supporters }});
            supportersHandle[id] = Meteor.Collection._publishCursor(supportersCursor, subscription, 'users');

            // Publish all Activities in a Partup
            var activitiesCursor = Activities.find({ partup_id: id });
            activitiesHandle[id] = Meteor.Collection._publishCursor(activitiesCursor, subscription, 'activities');

            subscription.added('partups', id, partup);
        },

        changed: function(id, fields) {
            subscription.changed('partups', id, fields);
        },

        removed: function(id) {
            uppersHandle[id] && uppersHandle[id].stop();
            activitiesHandle[id] && activitiesHandle[id].stop();
            subscription.removed('partups', id);
        }
    });

    subscription.ready();
    subscription.onStop(function() { partupHandle.stop(); });
});
