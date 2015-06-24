/*************************************************************/
/* Widget initial */
/*************************************************************/
var placeholders = {
    'location_input': function() {
        return __('pages-modal-register-details-form-location_input-placeholder');
    },
    'description': function() {
        return __('pages-modal-register-details-form-description-placeholder');
    },
    'tags_input': function() {
        return __('pages-modal-register-details-form-tags_input-placeholder');
    },
    'facebook': function() {
        return __('pages-modal-register-details-form-facebook-url-placeholder');
    },
    'twitter': function() {
        return __('pages-modal-register-details-form-twitter-url-placeholder');
    },
    'instagram': function() {
        return __('pages-modal-register-details-form-instagram-url-placeholder');
    },
    'linkedin': function() {
        return __('pages-modal-register-details-form-linkedin-url-placeholder');
    },
    'website': function() {
        return __('pages-modal-register-details-form-website-placeholder');
    },
    'phonenumber': function() {
        return __('pages-modal-register-details-form-phonenumber-placeholder');
    },
    'skype': function() {
        return __('pages-modal-register-details-form-skype-placeholder');
    }
};

Template.modal_register_details.onCreated(function() {
    var template = this;

    template.uploadingProfilePicture = new ReactiveVar(false);

    // uploaded picture url
    template.profilePictureUrl = new ReactiveVar('');
    template.currentImageId = new ReactiveVar('');

    // runs after image is updated
    template.autorun(function() {
        // get the current image
        var imageId = Template.instance().currentImageId.get();
        var image = Images.findOne({_id:imageId});
        if (!image) return;

        // load image from url
        var loadImage = new Image;
        loadImage.onload = function() {
            // this = image
            var src = this.src;

            // set image url
            template.profilePictureUrl.set(src);
            // set loading false
            template.uploadingProfilePicture.set(false);
        };
        // set image url to be loaded
        loadImage.src = image.url();
    });
});

/*************************************************************/
/* Widget helpers */
/*************************************************************/
Template.modal_register_details.helpers({
    formSchema: Partup.schemas.forms.registerOptional,
    placeholders: placeholders,
    profile: function() {
        var user = Meteor.user();
        return user ? user.profile : {};
    },
    profilePictureUrl: function() {
        var uploadedImageID = Template.instance().currentImageId.get();

        if (uploadedImageID) {
            var image = Images.findOne({_id: uploadedImageID});
            return image ? image.url({store: '360x360'}) : null;
        }

        var user = Meteor.user();

        if (user && user.profile && user.profile.image) {
            image = Images.findOne({_id: user.profile.image});
            if (!image) return false;
            return image.url();
        }
    },
    fieldsFromUser: function() {
        var user = Meteor.user();
        if (user) {
            return Partup.transformers.profile.toFormRegisterOptional(user);
        }
        return undefined;
    },
    uploadingProfilePicture: function() {
        return Template.instance().uploadingProfilePicture.get();
    },
    firstName: function() {
        var user = Meteor.user();
        if (!user) return false;
        var username = mout.object.get(user, 'profile.name') || mout.object.get(user, 'name');
        return Partup.client.strings.firstName(username);
    },
    placeSelectedCallback: function() {
        return function(results) {
            $('[name="location_input"]').val(results.placeId);
        };
    },
    clearCallback: function() {
        return function(results) {
            $('[name="location_input"]').val();
        };
    }
});

/*************************************************************/
/* Widget events */
/*************************************************************/
Template.modal_register_details.events({
    'click [data-browse-photos]': function eventClickBrowse(event, template) {
        event.preventDefault();

        // in stead fire click event on file input
        var input = $('input[data-profile-picture-input]');
        input.click();
    },
    'change [data-profile-picture-input]': function eventChangeFile(event, template) {
        FS.Utility.eachFile(event, function(file) {
            template.uploadingProfilePicture.set(true);

            Partup.client.uploader.uploadImage(file, function(error, image) {
                if (error) {
                    Partup.client.notify.error(__('pages-modal-register-details-form-image-error'));
                    template.uploadingProfilePicture.set(false);
                    return;
                }
                template.$('input[name=image]').val(image._id);
                template.currentImageId.set(image._id);

                template.uploadingProfilePicture.set(false);
            });

        });
    }
});

/*************************************************************/
/* Widget functions */
/*************************************************************/
var continueRegister = function() {

    // Execute intent callback
    Partup.client.intent.return('register-details', [], function() {
        Partup.client.intent.return('register');
    });

};

/*************************************************************/
/* Widget form hooks */
/*************************************************************/
AutoForm.hooks({
    'pages-modal-register-detailsForm': {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            var self = this;

            Meteor.call('users.update', insertDoc, function(error, res) {
                if (error && error.message) {
                    Partup.client.notify.error(error.reason);
                    AutoForm.validateForm(self.formId);
                    self.done(new Error(error.message));
                    return;
                }

                self.done();
                continueRegister();
            });

            return false;
        }
    }
});
