var d = Debug('accounts');

Accounts.onLogin(function(data) {
    var user = data.user;
    var logins = user.logins || [];

    d('User [' + user._id + '] has logged in');

    var now = new Date;
    var todayFormatted = now.toISOString().slice(0, 10);
    var daysLoggedInFormatted = logins.map(function(login) {
        return login.toISOString().slice(0, 10);
    });

    var userAlreadyLoggedInToday = daysLoggedInFormatted.indexOf(todayFormatted) > -1;

    if (!userAlreadyLoggedInToday) {
        // We are using the extended $push syntax, $slice with a negative
        // number means we save the latest x amount of items.
        Meteor.users.update({_id: user._id}, {$push: {logins: {$each: [now], $slice: -25}}});
        d('User [' + user._id + '] first login today, saving');
    } else {
        d('User [' + user._id + '] already logged in earlier today, not saving');
    }
});

Accounts.onCreateUser(function(options, user) {
    var imageUrl;
    var profile = options.profile;

    var liData = mout.object.get(user, 'services.linkedin');
    var fbData = mout.object.get(user, 'services.facebook');

    user.emails = user.emails || [];

    d('User registration detected, creating a new user');

    if (!liData && !fbData) {
        Meteor.setTimeout(function() {
            d('User registered with username and password, sending verification email');
            Accounts.sendVerificationEmail(user._id);
        }, 5000);
    }

    if (liData) {
        d('User used LinkedIn to register');

        var location = {};

        if (liData.location && liData.location.name) {
            var locationParts = liData.location.name.split(',');

            if (locationParts.length === 2) {
                location.city = locationParts[0].trim().replace(' Area', '');
                location.country = locationParts[1].trim();
            }
        }

        profile = {
            firstname: liData.firstName,
            lastname: liData.lastName,
            location: location,
            linkedin_url: 'https://linkedin.com/profile/view?id=' + liData.id,
            name: liData.firstName + ' ' + liData.lastName,
            settings: {
                locale: 'en',
                optionalDetailsCompleted: false
            }
        };

        imageUrl = liData.pictureUrl;
        user.emails.push({address: liData.emailAddress, verified: true});
    }

    if (fbData) {
        d('User used Facebook to register');

        profile = {
            firstname: fbData.first_name,
            gender: fbData.gender,
            lastname: fbData.last_name,
            facebook_url: 'https://facebook.com/' + fbData.id,
            name: fbData.name,
            settings: {
                locale: Partup.helpers.parseLocale(fbData.locale),
                optionalDetailsCompleted: false
            }
        };

        imageUrl = 'https://graph.facebook.com/' + fbData.id + '/picture?width=750';
        user.emails.push({address: fbData.email, verified: true});
    }

    try {
        var result = HTTP.get(imageUrl, {'npmRequestOptions': {'encoding': null}});
        var buffer = new Buffer(result.content, 'binary');

        var ref = new FS.File();
        ref.attachData(buffer, {type: 'image/jpeg'});
        ref.name(user._id + '.jpg');

        var image = Images.insert(ref);
        profile.image = image._id;
    } catch (error) {
        Log.error(error.message);
    }

    if (!profile.image) {
        d('Registered user has no image so far, using one of the default profile pictures');

        var images = Images.find({'meta.default_profile_picture': true}).fetch();
        image = mout.random.choice(images);
        profile.image = image._id;
    }

    user.completeness = 0;
    user.profile = profile;

    return user;
});

Accounts.validateNewUser(function(user) {
    var emailAddress = findPossibleEmailAddresses(user);

    var socialUser = Meteor.users.findOne({'emails.address': emailAddress});
    var passwordUser = Meteor.users.findOne({'registered_emails.address': emailAddress});

    if (socialUser || passwordUser) {
        throw new Meteor.Error(403, 'Email already exists');
    }

    Event.emit('users.inserted', user);

    return true;
});

function findPossibleEmailAddresses(user) {
    if (user.emails && user.emails.length) {
        return user.emails[0].address;
    }

    return mout.object.get(user, 'services.linkedin.emailAddress') ||
        mout.object.get(user, 'services.facebook.email') ||
        false;
}
