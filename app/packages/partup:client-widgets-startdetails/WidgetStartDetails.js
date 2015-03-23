Template.WidgetStartDetails.helpers({
    Partup: Partup,
    placeholders: Partup.services.placeholders.startdetails,
    partup: function () {
        var partupId = Session.get('partials.start-partup.current-partup');
        return Partups.findOne({ _id: partupId });
    },
    fieldsFromPartup: function() {
        var partupId = Session.get('partials.start-partup.current-partup');
        if (partupId) {
            var partup = Partups.findOne({_id: partupId});
            return Partup.transformers.partup.toFormStartPartup(partup);
        }
        return undefined;
    }
});

Template.WidgetStartDetails.events({
    //
});

Template.WidgetStartDetails.rendered = function() {
    //
};

AutoForm.hooks({
    partupForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();

            var partupId = Session.get('partials.start-partup.current-partup');

            if(partupId) {
                Meteor.call('partups.update', partupId, insertDoc, function(error, res){
                    if(error) {
                        console.log('something went wrong', error);
                        return false;
                    }
                    Router.go('start-activities', {_id:partupId});
                });
            } else {
                Meteor.call('partups.insert', insertDoc, function(error, res){
                    if(error) {
                        console.log('something went wrong', error);
                        return false;
                    }
                    Session.set('partials.start-partup.current-partup', res._id);
                    Router.go('start-activities', {_id:res._id});
                })
            }
        }
    }
});
