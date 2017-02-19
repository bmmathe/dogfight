var fight = require('./fight.js');
var dog = require('./dog.js');

module.exports = {
    listen: listen
};

function listen(req, res) {
    var request = req.body;
    var commands = request.text.split(' ');
    var description = '';
    switch(commands[1]) {
        case "fight":
            var dogs = [commands[2], commands[3]];
            fight.queueFight(dogs);
            description = "Fight queued";
            break;
        default:
            res.status(404).json({message: "Command not found"});
            break;
    }

    res.json({success: 1, description: description});
}