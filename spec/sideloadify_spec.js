var sideloadify = require('../index');

describe("sideloadify", function (){
    var testObject = {
        property : 100,
        foos : [
            {
                fid : 1,
                text : "one"
            },
            {
                fid : 2,
                text : "two"
            }
        ]
    }

    it("should correctly add main object name", function () {
        var result = sideloadify(testObject, {
            wrapper: { singular : 'wrapper', plural : 'WRONG' }
        });
        expect(result).toEqual({
                wrapper: {
                    property: 100,
                    foos : [
                        { fid : 1, text : "one" },
                        { fid : 2, text : "two" }
                    ]

                }
            });
    });

    it("should correctly move child objects to sideloads", function () {
        var result = sideloadify(testObject, {
            wrapper: { singular : 'wrapper', plural : 'WRONG' },
            sideloading: [
                { property : 'foos', idAttribute : 'fid', as: 'sideloads'}
            ]
        });
        expect(result).toEqual({
            wrapper: {
                property : 100,
                foos : [1, 2]
            },
            sideloads : [
                { fid : 1, text : "one" },
                { fid : 2, text : "two" }
            ]
        });

    });


    it("should wrap an empty array correctly", function () {
        var result = sideloadify([], {
            wrapper: { singular : 'WRONG', plural : 'wrapperArray' },
            sideloading: [{ property : 'foos', idAttribute : 'fid', as: 'sideloads'}]
        });
        expect(result).toEqual({ wrapperArray: [] });
    });

    var testObjectArray = [{
        property : 100,
        foos : [ { fid : 1, text : "one" }, { fid : 2, text : "two" } ]
    }, {
        property : 200,
        foos : [ { fid : 2, text : "two" }, { fid : 3, text : "three" } ]
    }];

    it("should correctly wrap an array of inputs", function () {
        var result = sideloadify(testObjectArray, {
            wrapper: { singular : 'WRONG', plural : 'wrapperArray' }
        });
        expect(result).toEqual({
            wrapperArray : testObjectArray
        })
    });

    it("should correctly move child objects to sideloads from array", function() {
        var result = sideloadify(testObjectArray, {
            wrapper: { singular : 'WRONG', plural : 'wrapperArray' },
            sideloading: [
                { property : 'foos', idAttribute : 'fid', as: 'sideloads'}
            ]
        });
        expect(result).toEqual({
            wrapperArray: [
                { property: 100, foos: [1, 2] },
                { property: 200, foos: [2, 3] }
            ],
            sideloads : [
                { fid : 1, text : "one" },
                { fid : 2, text : "two" },
                { fid : 3, text : "three" }
            ]
        });

    });

    var testObject2 = {
        property : 100,
        foosOne : [
            {
                fid : 1,
                text : "one"
            },
            {
                fid : 2,
                text : "two"
            }
        ],
        foosTwo : [
            {
                fid : 2,
                text : "two"
            },
            {
                fid : 3,
                text : "three"
            }
        ]

    };

    it("should correctly combine sideloads from different structures", function() {
        var result = sideloadify(testObject2, {
            wrapper: { singular : 'wrapper', plural : 'WRONG' },
            sideloading: [
                { property : 'foosOne', idAttribute : 'fid', as: 'sideloads'},
                { property : 'foosTwo', idAttribute : 'fid', as: 'sideloads'}
            ]
        });
        expect(result).toEqual({
            wrapper: {
                property: 100,
                foosOne : [1, 2],
                foosTwo : [2, 3]
            },
            sideloads : [
                { fid : 1, text : "one" },
                { fid : 2, text : "two" },
                { fid : 3, text : "three" }
            ]
        });
    });

    var nestedObjects = {
        name: "root",
        children : [
            { cid: 1, name : "child1", grandchildren: [{ gid: 1, title : "grandChild1"}] },
            { cid: 2, name : "child2", grandchildren: [{ gid: 2, title : "grandChild2"}, { gid: 3, title : "grandChild3"}] }
        ]
    };

    it("should handle nested objects correctly", function () {
        var result = sideloadify(nestedObjects, {
            wrapper: { singular : 'root', plural : 'WRONG' },
            sideloading: [
                { property : 'children.grandchildren', idAttribute : 'gid', as: 'grandchildren'},
                { property : 'children', idAttribute : 'cid', as: 'children'}
            ]
        });
        expect(result).toEqual({
            root: { name: "root", children: [1, 2] },
            children: [
                { cid: 1, name: "child1", grandchildren: [1]},
                { cid: 2, name: "child2", grandchildren: [2, 3]}
            ],
            grandchildren: [
                { gid: 1, title: "grandChild1"},
                { gid: 2, title: "grandChild2"},
                { gid: 3, title: "grandChild3"}
            ]
        })

    });
});
