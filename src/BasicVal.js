var BasicVal = (function(){

    var logger;
    if((typeof require) === 'function'){
        logger = require('tracer').console();
    }

    /* istanbul ignore if */
    if((typeof require) === 'function'){
        FieldVal = require("fieldval");
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                var kValue;
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    var BasicVal = {
        errors: {
            too_short: function(min_len) {
                return {
                    error: 100,
                    error_message: "Length is less than " + min_len
                };
            },
            too_long: function(max_len) {
                return {
                    error: 101,
                    error_message: "Length is greater than " + max_len
                };
            },
            too_small: function(min_val) {
                return {
                    error: 102,
                    error_message: "Value is less than " + min_val
                };
            },
            too_large: function(max_val) {
                return {
                    error: 103,
                    error_message: "Value is greater than " + max_val
                };
            },
            not_in_list: function() {
                return {
                    error: 104,
                    error_message: "Value is not a valid choice"
                };
            },
            cannot_be_empty: function() {
                return {
                    error: 105,
                    error_message: "Value cannot be empty."
                };
            },
            no_prefix: function(prefix) {
                return {
                    error: 106,
                    error_message: "Value does not have prefix: " + prefix
                };
            },
            invalid_email: function() {
                return {
                    error: 107,
                    error_message: "Invalid email address format."
                };
            },
            invalid_url: function() {
                return {
                    error: 108,
                    error_message: "Invalid url format."
                };
            },
            incorrect_length: function(len){
                return {
                    error: 109,
                    error_message: "Length is not equal to " + len
                };
            },
            no_suffix: function(suffix) {
                return {
                    error: 110,
                    error_message: "Value does not have suffix: " + suffix
                };
            },
            //111 in DateVal
            //112 in DateVal
            not_equal: function(match){
                return {
                    error: 113,
                    error_message: "Not equal to " + match + ".",

                };
            },
            //114 in DateVal
            no_valid_option: function(){//Should be overriden in most cases
                return {
                    error: 115,
                    error_message: "None of the options were valid.",
                };
            },
            contains_whitespace: function(){
                return {
                    error: 116,
                    error_message: "Contains whitespace."
                };
            },
            must_start_with_letter: function(){
                return {
                    error: 117,
                    error_message: "Must start with a letter."
                };  
            },
            value_in_list: function() {
                return {
                    error: 104,
                    error_message: "Value not allowed"
                };
            }
        },
        equal_to: function(match, flags){
            var check = function(value) {
                if (value!==match) {
                    return FieldVal.create_error(BasicVal.errors.not_equal, flags, match);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        merge_required_and_flags: function(required, flags){
            if((typeof required)==="object"){
                flags = required;
            } else {
                if(!flags){
                    flags = {};
                }
                flags.required = required;
            }
            return flags;
        },
        integer: function(required, flags){
            return FieldVal.type("integer",BasicVal.merge_required_and_flags(required, flags));
        },
        number: function(required, flags){
            return FieldVal.type("number",BasicVal.merge_required_and_flags(required, flags));
        },
        array: function(required, flags){
            return FieldVal.type("array",BasicVal.merge_required_and_flags(required, flags));
        },
        object: function(required, flags){
            return FieldVal.type("object",BasicVal.merge_required_and_flags(required, flags));
        },
        float: function(required, flags){
            return FieldVal.type("float",BasicVal.merge_required_and_flags(required, flags));
        },
        boolean: function(required, flags){
            return FieldVal.type("boolean",BasicVal.merge_required_and_flags(required, flags));
        },
        string: function(required, flags){
            flags = BasicVal.merge_required_and_flags(required, flags);
            var check = function(value, emit) {

                var core_check = FieldVal.type("string",flags);
                if(typeof core_check === 'object'){
                    //Passing flags turns the check into an object
                    core_check = core_check.check;
                }

                //Passing emit means that the value can be changed
                var error = core_check(value,emit);
                if(error) return error;

                if(!flags || flags.trim!==false){//If not explicitly false
                    value = value.trim();
                }
                if (value.length === 0) {
                    if(required || required===undefined){
                        return FieldVal.REQUIRED_ERROR;
                    } else {
                        return FieldVal.NOT_REQUIRED_BUT_MISSING;
                    }
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        length: function(len, flags) {
            var check = function(value) {
                if (value.length!==len) {
                    return FieldVal.create_error(BasicVal.errors.incorrect_length, flags, len);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        min_length: function(min_len, flags) {
            var check = function(value) {
                if (value.length < min_len) {
                    return FieldVal.create_error(BasicVal.errors.too_short, flags, min_len);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        max_length: function(max_len, flags) {
            var check = function(value) {
                if (value.length > max_len) {
                    return FieldVal.create_error(BasicVal.errors.too_long, flags, max_len);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        no_whitespace: function(flags) {
            var check = function(value) {
                if (/\s/.test(value)){
                    return FieldVal.create_error(BasicVal.errors.contains_whitespace, flags, max_len);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        minimum: function(min_val, flags) {
            var check = function(value) {
                if (value < min_val) {
                    return FieldVal.create_error(BasicVal.errors.too_small, flags, min_val);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        maximum: function(max_val, flags) {
            var check = function(value) {
                if (value > max_val) {
                    return FieldVal.create_error(BasicVal.errors.too_large, flags, max_val);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        range: function(min_val, max_val, flags) {
            //Effectively combines minimum and maximum
            var check = function(value){
                if (value < min_val) {
                    return FieldVal.create_error(BasicVal.errors.too_small, flags, min_val);
                } else if (value > max_val) {
                    return FieldVal.create_error(BasicVal.errors.too_large, flags, max_val);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        one_of: function(array, flags) {
            var valid_values = [];
            if(Object.prototype.toString.call(array) === '[object Array]'){
                for(var i = 0; i < array.length; i++){
                    var option = array[i];
                    if((typeof option) === 'object'){
                        valid_values.push(option[0]);
                    } else {
                        valid_values.push(option);
                    }
                }
            } else {
                for(var k in array){
                    valid_values.push(k);
                }
            }
            var check = function(value) {
                if (valid_values.indexOf(value) === -1) {
                    return FieldVal.create_error(BasicVal.errors.not_in_list, flags);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        not_one_of: function(array, flags) {
            var valid_values = [];
            if(Object.prototype.toString.call(array) === '[object Array]'){
                for(var i = 0; i < array.length; i++){
                    var option = array[i];
                    if((typeof option) === 'object'){
                        valid_values.push(option[0]);
                    } else {
                        valid_values.push(option);
                    }
                }
            } else {
                for(var k in array){
                    valid_values.push(k);
                }
            }
            var check = function(value) {
                if (valid_values.indexOf(value) !== -1) {
                    return FieldVal.create_error(BasicVal.errors.value_in_list, flags);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        not_empty: function(trim, flags) {
            var check = function(value) {
                if (trim) {
                    if (value.trim().length === 0) {
                        if(typeof flags.error){
                        }
                        return FieldVal.create_error(BasicVal.errors.cannot_be_empty, flags);
                    }
                } else {
                    if (value.length === 0) {
                        return FieldVal.create_error(BasicVal.errors.cannot_be_empty, flags);
                    }
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        prefix: function(prefix, flags) {
            var check = function(value) {
                if (value.length >= prefix.length) {
                    if (value.substring(0, prefix.length) != prefix) {
                        return FieldVal.create_error(BasicVal.errors.no_prefix, flags, prefix);
                    }
                } else {
                    return FieldVal.create_error(BasicVal.errors.no_prefix, flags, prefix);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        start_with_letter: function(flags) {
            var check = function(value) {
                if (value.length > 0) {
                    var char_code = value.charCodeAt(0);
                    if( !((char_code >= 65 && char_code <= 90) || (char_code >= 97 && char_code <= 122))){
                        return FieldVal.create_error(BasicVal.errors.must_start_with_letter, flags);
                    }
                } else {
                    return FieldVal.create_error(BasicVal.errors.must_start_with_letter, flags);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        suffix: function(suffix, flags) {
            var check = function(value) {
                if (value.length >= suffix.length) {
                    if (value.substring(value.length-suffix.length, value.length) != suffix) {
                        return FieldVal.create_error(BasicVal.errors.no_suffix, flags, suffix);
                    }
                } else {
                    return FieldVal.create_error(BasicVal.errors.no_suffix, flags, suffix);
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        each: function(on_each, flags) {
            var check = function(array, emit, callback) {
                

                var i = 0;
                var end = function(end_value){
                    logger.log("end ",end_value);

                    if(callback){
                        callback(end_value);
                    } else {
                        to_return = end_value;
                    }
                }
                var do_possible = function(){
                    logger.log("do_possible ",i);
                    i++;
                    logger.log(i, array.length);
                    if(i>array.length){
                        end();
                        return;
                    }
                    var value = array[i-1];

                    FieldVal.use_checks(value, option, {
                        field_name: null,
                        validator: null,
                        emit: function(emitted_value){
                            array[i-1] = emitted_value;
                        }
                    }, function(response){
                        logger.log("response ",response);
                        if(response===undefined){
                            logger.log("success");
                            end(undefined);//Success
                        } else {
                            do_possible();
                        }
                    });
                    logger.log("end of do_possible");
                }





                var validator = new FieldVal(null);
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];

                    var res = on_each(value,i,emit,callback);
                    if (res !== undefined) {
                        validator.invalid("" + i, res);
                    }
                }



                var error = validator.end();
                if(error!==undefined){
                    return error;
                }
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        multiple: function(possibles, flags){

            possibles = possibles || [];
            if(possibles.length===0){
                console.error("BasicVal.multiple called without possibles.");
                return;
            }

            var to_return;
            var check = function(value, emit, callback){
                var emitted_value;
                var emit_for_check = function(emitted){
                    emitted_value = emitted;
                };
                var i = 0;
                var end = function(end_value){
                    logger.log("end ",end_value);

                    if(callback){
                        callback(end_value);
                    } else {
                        to_return = end_value;
                    }
                }
                var do_possible = function(){
                    logger.log("do_possible ",i);
                    i++;
                    logger.log(i, possibles.length);
                    if(i>possibles.length){
                        end(FieldVal.create_error(BasicVal.errors.no_valid_option, flags));
                        return;
                    }
                    var option = possibles[i-1];

                    FieldVal.use_checks(value, option, {
                        field_name: null,
                        validator: null,
                        emit: emit_for_check
                    }, function(response){
                        logger.log("response ",response);
                        if(response===undefined){
                            logger.log("success");
                            end(undefined);//Success
                        } else {
                            do_possible();
                        }
                    });
                    logger.log("end of do_possible");
                }
                do_possible();
                logger.log("RETURNING ",to_return);
                return to_return;
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        email: function(flags){
            var check = function(value) {
                var re = BasicVal.email_regex;
                if(!re.test(value)){
                    return FieldVal.create_error(BasicVal.errors.invalid_email, flags);
                } 
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        },
        url: function(flags){
            var check = function(value) {
                var re = BasicVal.url_regex;
                if(!re.test(value)){
                    return FieldVal.create_error(BasicVal.errors.invalid_url, flags);
                } 
            };
            if(flags){
                flags.check = check;
                return flags;
            }
            return {
                check: check
            };
        }
    };

    BasicVal.email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    BasicVal.url_regex = /^(https?):\/\/(((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])))(:[1-9][0-9]+)?(\/)?([\/?].+)?$/;

    return BasicVal;
}).call();

if (typeof module != 'undefined') {
    module.exports = BasicVal;
}