var request = require('request');
var config = require('../../config.js');

exports.send = function(message) {
    request.post(config.slackIncomingWebHook).json({text: message});
}