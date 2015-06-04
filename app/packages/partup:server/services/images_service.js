/**
 @namespace Partup server images service
 @name Partup.server.services.images
 @memberOf partup.server.services
 */
Partup.server.services.images = {

    /**
     * Store a focuspoint in an image
     *
     * @param  {string} imageId
     * @param  {number} focuspoint_x
     * @param  {number} focuspoint_y
     */
    storeFocuspoint: function(imageId, focuspoint_x, focuspoint_y) {

        if (!imageId) throw new Error('Required argument [imageId] is missing for method [Partup.server.services.images::storeFocuspoint]');
        if (!mout.lang.isNumber(focuspoint_x)) throw new Error('Required argument [focuspoint_x] is not a number for method [Partup.server.services.images::storeFocuspoint]');
        if (!mout.lang.isNumber(focuspoint_y)) throw new Error('Required argument [focuspoint_y] is not a number for method [Partup.server.services.images::storeFocuspoint]');
        if (focuspoint_x < 0 || focuspoint_x > 1) throw new Error('Argument [focuspoint_x] is not a number between 0 and 1 for method [Partup.server.services.images::storeFocuspoint]');
        if (focuspoint_y < 0 || focuspoint_y > 1) throw new Error('Argument [focuspoint_y] is not a number between 0 and 1 for method [Partup.server.services.images::storeFocuspoint]');

        var image = Images.findOne(imageId);
        if (!image) throw new Error('Could not find an image by [imageId] for method [Partup.server.services.images::storeFocuspoint]');

        var focuspoint = {
            x: focuspoint_x,
            y: focuspoint_y
        };

        Images.update(imageId, {$set: {focuspoint: focuspoint}});

    }

};
