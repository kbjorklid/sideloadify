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
 *     sideloads: [
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
 * @param {string} options.sideloads.property - the path to the property containing the target object or object array
 *      to sideload.
 * @param {string} options.sideloads.idAttribute - the name of the attribute containing the unique identifier for
 *      the sideloaded objects
 * @param {string} [options.sideloads.as] - the name of the property containing the sideloaded object array. If
 *      left unspecified, the objects will not be added to sideloading - only the reference ID or ID array is
 *      used to replace the nested object.
 * @returns {Object} sideloadified copy of target
 */
module.exports = function sideloadify(target, options) {
    var inputClone, inputAsArray, sideloadContainer, results, mainPropertyName, inputIsArray, sideloadSpecs;
    sortSideloads(options);
    sortRenames(options);
    inputIsArray = _.isArray(target);
    inputClone = _.cloneDeep(target);
    inputAsArray = toArray(inputClone);
    deleteProps(inputAsArray, options.delete);
    renameProps(inputAsArray, options.rename);
    mainPropertyName = (!inputIsArray) ? options.wrapper.singular : options.wrapper.plural;
    sideloadContainer = {};
    sideloadSpecs = toArray(options.sideloads);
    _.forEach(sideloadSpecs, function (sideloadOpts) {
        extractSingleSideload(inputAsArray, sideloadOpts, sideloadContainer);
    });
    _.forEach(sideloadSpecs, function(opts, key) {
        if (sideloadContainer[opts.as]) {
            sideloadContainer[opts.as] = removeDuplicatesById(sideloadContainer[opts.as], opts.idAttribute);
        }
    });
    results = {};
    results[mainPropertyName] = (inputAsArray.length === 1 && !inputIsArray) ? inputAsArray[0] : inputAsArray;
    _.assign(results, sideloadContainer);
    return results;
};

function extractSingleSideload(inputAsArray, sideloadOpts, sideloadContainer) {
    var tmp, sideloadArray = [];
    _.forEach(inputAsArray, function (model) {
        tmp = extractSideloaded(model, sideloadOpts);
        if (tmp && tmp.length > 0) {
            sideloadArray = sideloadArray.concat(tmp);
        }
    });
    if (sideloadArray.length > 0 && sideloadOpts.as) {
        tmp = sideloadContainer[sideloadOpts.as];
        tmp = (tmp) ? tmp.concat(sideloadArray) : sideloadArray;
        tmp && (sideloadContainer[sideloadOpts.as] = tmp);
    }
}

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

// Need to make sure the most deeply nested sideloads are extracted before less deeply nested. This
// can be ensured by sorting sideload specs by the property path length
function sortSideloads(spec) {
    if (!_.isArray(spec.sideloads) || spec.sideloads.length <= 1) {
        return;
    }
    spec.sideloads.sort(function (a, b) {
        if (a.property.length > b.property.length) {
            return -1;
        } else if (a.property.length < b.property.length) {
            return 1;
        }
        return 0;
    });
}


function sortRenames(spec) {
    if (!_.isArray(spec.rename) || spec.rename.length <= 1) {
        return;
    }
    spec.rename.sort(function (a, b) {
        if (a.property.length > b.property.length) {
            return -1;
        } else if (a.property.length < b.property.length) {
            return 1;
        }
        return 0;
    });
}


function deleteProps(targetArray, propsToDelete) {
    if (propsToDelete) {
        targetArray.forEach(function (target) {
            objectUtils.forEachProperty(target, propsToDelete, function (value, parent, lastPropertyName) {
                delete parent[lastPropertyName];
            });
        })
    }
}

function renameProps(targetArray, renameSpecs) {
    var renameSpecArray;
    if (renameSpecs) {
        renameSpecArray = toArray(renameSpecs);
        targetArray.forEach(function(target) {
            renameSpecArray.forEach(function (spec) {
                objectUtils.forEachProperty(target, spec.property, function (value, parent, lastPropertyName) {
                    if (parent.hasOwnProperty(lastPropertyName)) {
                        parent[spec.name] = parent[lastPropertyName];
                        delete parent[lastPropertyName];
                    }
                });
            });
        });
    }
}

function toArray(target, undefinedVal) {
    if (target === undefined) {
        return undefinedVal;
    }
    return (_.isArray(target)) ? target : [ target ];
}