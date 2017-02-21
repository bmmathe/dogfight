var fs = require('fs');
fs.rename('./config.js', './config2.js', function() {
    fs.rename('./config.hidden.js', './config.js', function() {
        fs.rename('./config2.js', './config.hidden.js', function() {
            console.log("Done copying configs.");
        });
    });    
});