var express = require('express');

module.exports = function(app)
{
    app.use('/public', express.static('./public'));
    app.get('/', function(req, res)
    	{
    		res.render('index');
    	});
}