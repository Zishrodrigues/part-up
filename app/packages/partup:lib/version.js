/**
 * @namespace Version
 */
Version = {
    get: function() {
        HTTP.get(Meteor.absoluteUrl('VERSION'), function(error, response) {
            if (error || !response) return;

            // Be sure the result is a binary file
            if (response.headers['content-type'] !== 'application/octet-stream') return;

            if (!response.content) return;

            // Parse data
            var parsed_versiondata = JSON.parse(response.content);

            // Log data
            console.info({
                version: parsed_versiondata.version,
                deploydate: parsed_versiondata.deploydate
            });
        });
    }
};
