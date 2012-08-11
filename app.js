
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var routes_admin = require('./routes/admin.js');
var routes_ajax = require('./routes/ajax.js');
var dot_express = require('./dot.express');
//var RedisStore = require('connect-redis')(express);

    

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.register(".html", dot_express);
    app.set('view cache', false);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: "keyboard cat"}));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    
});

//app.configure('development', function(){
//    app.use(express.errorHandler({
//        dumpExceptions: true, 
//        showStack: true
//    })); 
//});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});



// Routes

app.get('/', routes.index);
app.get('/article/:id/', routes.article);
app.get('/article_replies/:id/', routes.article_replies);
app.get('/articles/:name/:pageIndex?', routes.articles);
app.get('/ajax/get_article/:id/', routes_ajax.get_article);
//app.get('/article/:id/', routes.test);

//admin Routes
app.get('/woyaodenglua', routes_admin.login);
app.get('/logout', routes_admin.logout)
app.post('/login/check/',routes_admin.login_check);
app.get('/admin/article_add/', routes_admin.article_add);
app.get('/admin/article_edit/:id/', routes_admin.article_edit);
app.get('/admin/article_delete/:id/', routes_admin.article_delete);
app.post('/admin/save_article/', routes_admin.save_article);
app.post('/admin/save_article_reply/', routes_admin.save_article_reply);
app.post('/admin/delete_article_reply/', routes_admin.delete_article_reply);
app.get('/admin/delete_configs/:id/', routes_admin.delete_configs);
app.post('/admin/change_password/', routes_admin.change_password);
app.get('/*', function(req, res) {
    res.redirect('/');
});



app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

