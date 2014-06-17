var logger = require("tracer").console();
var FieldVal = require('fieldval');
var bval = require("../fieldval-basicval");
var assert = require("assert")

describe('FieldVal', function() {
    describe('get()', function() {
        it('should return value when the value is present', function() {
            var my_validator = new FieldVal({
                "my_value": 13
            })
            assert.equal(13, my_validator.get("my_value", bval.integer(true)));
        })

        it('should return value when an optional value is present', function() {
            var my_validator = new FieldVal({
                "my_value": 17
            })
            assert.equal(17, my_validator.get("my_value", bval.integer(false)));
        })

        it('should return an integer when an integer is requested and the value is an integer string', function() {
            var my_validator = new FieldVal({
                "my_integer": "26"
            })
            assert.equal(26, my_validator.get("my_integer", bval.integer(true, {parse: true})));
        })

        it('should return an email when an string of valid syntax is present', function() {
            var my_validator = new FieldVal({
                "my_email": "example-user@test.com"
            })
            assert.equal("example-user@test.com", my_validator.get("my_email", bval.string(true), bval.email()));
        })

        it('should return a float when an float is requested and the value is a float string', function() {
            var my_validator = new FieldVal({
                "my_float": "43.5"
            })
            assert.equal(43.5, my_validator.get("my_float", bval.float(true, {parse: true})));
        })

        it('should return null when the value is the wrong type', function() {
            var my_validator = new FieldVal({
                "my_string": 13
            })
            assert.equal(null, my_validator.get("my_string", bval.string(true)));
        })

        it('should return null when the requested value is not present', function() {
            var my_validator = new FieldVal({
                "my_string": 13
            })
            assert.equal(null, my_validator.get("Non-existant", bval.string(true)));
        })
    })
})