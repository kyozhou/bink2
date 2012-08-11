// dot.express.js
var dot = require('dot');
dot.templateSettings.evaluate =     /\<\?js([\s\S]+?)\?\>/g;
dot.templateSettings.interpolate =  /\<\?js=([\s\S]+?)\?\>/g;
dot.templateSettings.encode=        /\<\?js!([\s\S]+?)\?\>/g;
dot.templateSettings.use=        /\<\?js#([\s\S]+?)\?\>/g;
dot.templateSettings.varname = '$';

exports.compile = function(str, options) {
    
    return dot.template(str);
};