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
    };

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
            sideloads: [
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

    it("should correctly sideload with single object as sideload def", function () {
        var testobject = {
            id: 1,
            children: [
                { id: 1, child: "barney" }
            ]
        };
        var spec = {
            wrapper: { singular: 'wrapper', plural: 'wrong'},
            sideloads: { property: 'children', idAttribute: 'id', as: 'sideloads' }
        };
        expect(sideloadify(testobject, spec)).toEqual({
            wrapper: { id : 1, children : [1] },
            sideloads: [ {id: 1, child: "barney" } ]
        });
    });


    it("should wrap an empty array correctly", function () {
        var result = sideloadify([], {
            wrapper: { singular : 'WRONG', plural : 'wrapperArray' },
            sideloads: [{ property : 'foos', idAttribute : 'fid', as: 'sideloads'}]
        });
        expect(result).toEqual({ wrapperArray: [] });
    });

    it("should not create an empty sideload array", function () {
        var input = {
            id: 1,
            children: []
        };
        var opts = {
            wrapper: { singular : 'wrap', plural: 'WRONG' },
            sideloads: [ { property: 'children', idAttribute: 'id', as: 'sideloads'}]
        };
        expect(sideloadify(input, opts)).toEqual({
            wrap : {
                id: 1,
                children: []
            }
        });
    });

    it("should ignore not found sideloads", function () {
        var input = {
            id: 1
        };
        var opts = {
            wrapper: { singular : 'wrap', plural: 'WRONG' },
            sideloads: [ { property: 'children', idAttribute: 'id', as: 'sideloads'}]
        };
        expect(sideloadify(input, opts)).toEqual({
            wrap : {
                id: 1
            }
        });
    });

    it("should wrap objects without defining plural wrapper name", function () {
        var input = {
            id : 1
        };
        var opts = {
            wrapper: { singular : 'wrap'}
        };
        expect(sideloadify(input, opts)).toEqual({
            wrap : {
                id: 1
            }
        });
    });

    it("should wrap arrays without defining singular wrapper name", function () {
        var input = [
            {id : 1}
        ];
        var opts = {
            wrapper: { plural : 'wraps'}
        };
        expect(sideloadify(input, opts)).toEqual({
            wraps : [{
                id: 1
            }]
        });
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
        });
    });

    it("should correctly move child objects to sideloads from array", function() {
        var result = sideloadify(testObjectArray, {
            wrapper: { singular : 'WRONG', plural : 'wrapperArray' },
            sideloads: [
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
            sideloads: [
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
            sideloads: [
                { property : 'children', idAttribute : 'cid', as: 'children'},
                { property : 'children.grandchildren', idAttribute : 'gid', as: 'grandchildren'}
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

    it("should handle single inline objects correctly", function () {
        var testObj = {
            name : "Foo",
            child : {
                id : 1,
                title : "Bar"
            }
        };
        var result = sideloadify(testObj, {
            wrapper: { singular : 'root', plural : 'WRONG' },
            sideloads: [
                { property : 'child', idAttribute : 'id', as: 'children'},
            ]
        });
        expect(result).toEqual({
            root: { name: "Foo", child: 1 },
            children: [
                { id : 1, title : "Bar" }
            ]
        });
    });

    it("should successfully delete simple properties", function () {
        var testObj = {
            id: 1,
            name : "Foo"
        };
        var spec = {
            wrapper: { singular: 'wrapper'},
            delete: ['name']
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1
            }
        });
    });

    it("should successfully delete nested properties", function () {
        var testObj = {
            id: 1,
            nested: {
                name : "Foo",
                name2 : "Bar"
            }
        };
        var spec = {
            wrapper: { singular: 'wrapper'},
            delete: ['nested.name']
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                nested: {
                    name2: "Bar"
                }
            }
        });
    });

    it("should successfully delete properties inside array", function () {
        var testObj = {
            id: 1,
            arr: [
                {
                    x: "y",
                    target : "Foo"
                },
                {
                    z: "x",
                    target : "Bar"
                }
            ]
        };
        var spec = {
            wrapper: { singular: 'wrapper'},
            delete: ['arr.target']
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                arr: [
                    { x: "y"},
                    { z: "x"}
                ]
            }
        })
    });

    it("should successfully delete properties inside sideloadified objects", function () {
        var testObj = {
            id : 1,
            children: [
                { id: 1, name: "child 1", target: "foo"},
                { id: 2, name: "child 2", target: "bar"}
            ]
        };
        var spec = {
            wrapper: { singular: 'wrapper'},
            sideloads: {property: 'children', idAttribute: 'id', as: 'children'},
            delete: ['children.target']
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                children: [1, 2]
            },
            children: [
                { id: 1, name: "child 1"},
                { id: 2, name: "child 2"}
            ]
        })
    });

    it("should delete properties within array root", function() {
        var testArr = [
            { id: 1, target: "foo" },
            { id: 2, target: "bar" }
        ];
        var spec = {
            wrapper: { plural: 'wrapper'},
            delete: ['target']
        };
        expect(sideloadify(testArr, spec)).toEqual({
            wrapper: [
                { id: 1 },
                { id: 2 }
            ]
        });
    });

    it("should ignore non-existent properties when deleting", function () {
        var testObj = {
            id: 1,
            name: "foo"
        };
        var spec = {
            wrapper: { singular: 'wrapper' },
            delete: ['target']
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                name: "foo"
            }
        });
    });


    it("should successfully rename simple property on single root", function () {
        var testObj = {
            id: 1,
            foo: "foo"
        };
        var spec = {
            wrapper: { singular: 'wrapper' },
            rename: { property: "foo", name: "bar" }
        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                bar: "foo"
            }
        })
    });

    it("should successfully rename two properties nested one inside other", function () {
        var testObj = {
            id: 1,
            foo: {
                bar: "bar"
            }
        };
        var spec = {
            wrapper: { singular: 'wrapper' },
            rename: [
                { property: "foo", name: "foo2" },
                { property: "foo.bar", name: "bar2" }
            ]

        };
        expect(sideloadify(testObj, spec)).toEqual({
            wrapper: {
                id: 1,
                foo2: {
                    bar2: "bar"
                }
            }
        })
    });

    it("should successfully rename before sideloading", function() {
            var testObj = {
                id : 1,
                children: [
                    { id: 1, name: "child 1"},
                    { id: 2, name: "child 2"}
                ]
            };
            var spec = {
                wrapper: { singular: 'wrapper'},
                sideloads: {property: 'children', idAttribute: 'id', as: 'children'},
                rename: { property: "children.name", name: "renamed" },
            };
            expect(sideloadify(testObj, spec)).toEqual({
                wrapper: {
                    id: 1,
                    children: [1, 2]
                },
                children: [
                    { id: 1, renamed: "child 1"},
                    { id: 2, renamed: "child 2"}
                ]
            });

        });

    it("should successfully sideload when sideload property is renamed", function() {
        var testObj = {
            "id": 1,
            "title": "Foo",
            "chapters": [
                { "id" : 1, "title": "First chapter" },
                { "id" : 2, "title": "Second chapter" }
            ]
        };
        var spec = {
            rename: { property: "chapters", name: "chapterList" },
            wrapper: { singular: "book", plural: "books" },
            sideloads: { property: "chapterList", idAttribute: "id", as: "chapters" }
        };
        expect(sideloadify(testObj, spec)).toEqual({
            "book": {
                "id": 1,
                "title": "Foo",
                "chapterList": [1, 2]
            },
            "chapters": [
                { "id" : 1, "title": "First chapter" },
                { "id" : 2, "title": "Second chapter" }
            ]
        });
    });
});
