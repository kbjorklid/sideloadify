var _ = require('lodash'),
    objectUtils = require('./lib/objectUtils');

/**
 * Returns a sideloadified copy of the target object
 * <p>
 * Example of options:
 * <pre>
 * {
 *     wrapper : {
 *         singular : 'book',
 *         plural : 'books'
 *     },
 *     sideloading: [
 *         {
 *             property : 'metadata.authors',
 *             idAttribute : 'id',
 *             as : 'authors'
 *         },
 *         {
 *             property : 'content.chapters',
 *             idAttribute : 'id',
 *             as : 'chapters'
 *         }
 *     ]
 * }
 * </pre>
 *
 *
 *
 * @param {Object|Object[]} target - the target object or array of objects
 * @param {Object} options - the sideload properties
 * @param {string} options.wrapper.singular - the singular name of the property that will contain the main object
 * @param {string} options.wrapper.plural - the singular name of the property that will contain the main object array
 * @param {string} options.sideloading.property - the path to the property containing the target object or object array
 *      to sideload.
 * @param {string} options.sideloading.idAttribute - the name of the attribute containing the unique identifier for
 *      the sideloaded objects
 * @param {string} [options.sideloading.as] - the name of the property containing the sideloaded object array. If
 *      left unspecified, the objects will not be added to sideloading - only the reference ID or ID array is
 *      used to replace the nested object.
 * @returns {Object} sideloadified copy of target
 */
module.exports = function sideloadify(target, options) {
    var inputClone, inputAsArray, sideloads, results, mainPropertyName, inputIsArray;
    inputIsArray = _.isArray(target);
    inputClone = _.cloneDeep(target);
    inputAsArray = (inputIsArray) ? inputClone : [ inputClone ];
    mainPropertyName = (!inputIsArray) ? options.wrapper.singular : options.wrapper.plural;
    sideloads = {};
    _.forEach(options.sideloading, function (sideloadOpts){
        var tmp, sideloadArray = [];
        _.forEach(inputAsArray, function (model) {
            tmp = extractSideloaded(model, sideloadOpts);
            if (tmp && tmp.length > 0) {
                sideloadArray = sideloadArray.concat(tmp);
            }
        });
        if (sideloadArray.length > 0 && sideloadOpts.as) {
            tmp = sideloads[sideloadOpts.as];
            tmp = (tmp) ? tmp.concat(sideloadArray) : sideloadArray;
            tmp && (sideloads[sideloadOpts.as] = tmp);
        }
    });
    _.forEach(options.sideloading, function(opts, key) {
        if (sideloads[opts.as]) {
            sideloads[opts.as] = removeDuplicatesById(sideloads[opts.as], opts.idAttribute);
        }
    });
    results = {};
    results[mainPropertyName] = (inputAsArray.length === 1 && !inputIsArray) ? inputAsArray[0] : inputAsArray;
    _.assign(results, sideloads);
    return results;
};

function removeDuplicatesById(targetArray, idAttrPath) {
    var id,
        isSimplePath = (idAttrPath.indexOf('.') < 0),
        handledIds = {};
    return _.filter(targetArray, function (i) {
        id = isSimplePath ? i[idAttrPath] : objectUtils.getValue(i, idAttrPath);
        if (id === undefined || handledIds[id]) {
            return false;
        } else {
            handledIds[id] = true;
            return true;
        }
    });
}

function extractSideloaded(fromJson, settings) {
    return objectUtils.replaceWithIdArray(fromJson, settings['property'], settings['idAttribute']);
}
