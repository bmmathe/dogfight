var fs = require('fs');
fs.renameSync('./config.js', './config2.js');
fs.renameSync('./config.hidden.js', './config.js');
fs.renameSync('./config2.js', './config.hidden.js');