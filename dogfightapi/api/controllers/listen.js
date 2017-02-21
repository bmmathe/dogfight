var fight = require('./fight.js');
var redis = require('../data/redis.js');

module.exports = {
    listen: listen    
};

function listen(req, res) {
    var request = req.body;
    var commands = request.text.split(' ');
    var command = commands[1];

    if(command == "commands") {
        res.json({text: 'fight {dog1 name} {dog2 name}\ngetdog {name}\ngetdogs\nadd attack {dog name} "[message]"\n```add attack Lola "{0} bites {1} on the nose."```'});
    } else if(command == "fight") {
        var dogs = [commands[2], commands[3]];
        fight.queueFight(dogs);
        res.json({text: "Preparing to fight..."});
    } else if(command == "getdogs") {
        redis.getAllDogs(function(redis_error, dogs) {
            var dogMessage = '';
            for(var i = 0; i < dogs.length; i++) {
                dogMessage += dogs[i];
                if(i !== dogs.length-1) {
                    dogMessage += '\n';
                }
            }
            res.json({text: dogMessage});
        });
    } else if(command == "getdog") {
        var dogName = commands[2];
        redis.getDog(dogName, function(err, dog) {
            res.json({text: '```'+JSON.stringify(dog)+'```'});
        });        
    } else if(command == "add") {
        var type = commands[2];
        var actions = request.split('"');
        var name = commands[3];
        var message = actions[1];
        var value = parseInt(actions[2]);

        if(type == "attack") {                        
            redis.addAttack(name, message, value,function(err, dog){
                res.json({text: "Attack added."});
            });
        } else if(type == "distraction") {
            redis.addDistraction(name, message, value,function(err, dog){
                res.json({text: "Attack added."});
            });
        } else {
            redis.addAction(name, message, value,function(err, dog){
                res.json({text: "Attack added."});
            });
        }
    } else {
        res.json({text: "Command not found: \"/dogfight commands\" to list available commands."});
    }            
}