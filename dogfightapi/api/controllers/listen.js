var fight = require('./fight.js');
var redis = require('../data/redis.js');
var util = require('util');

module.exports = {
    listen: listen    
};

function listen(req, res) {
    var request = req.body;
    var commands = request.text.split(' ');
    var command = commands[1];

    if(command == "commands") {
        res.json({text: 'Proceed all commands with *dogfight*\nfight {dog1 name} {dog2 name}\ngetdog {name}\ngetdogs\n\add dog {name} {gender} {weight}\n```add dog Lola female 65```\nnadd attack {dog name} "[message]" value\n```add attack Lola "{0} bites {1} on the nose." -20```\nadd distraction {dog name} "[message]" value\n```add distraction Lola "{0} sees a squirrel." -10```\nadd action {dog name} "[message]" value\n```add action Lola "{0} growls at {1}." 15```\nremove dog {name}'});
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
            res.json({text: '```'+JSON.stringify(dog, null, 2)+'```'});
        });        
    } else if(command == "add" || command == "remove") {
        var type = commands[2];
        var actions = request.text.split('"');
        var name = commands[3];
        var message = actions[1];
        var value = parseInt(actions[2]);

        if(comamnd == "add") {
            if(type == "attack") {                        
                redis.addAttack(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "distraction") {
                redis.addDistraction(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "action"){
                redis.addAction(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "dog") {
                redis.saveDog({name: commands[3], gender: commands[4], weight: parseInt(commands[5])}, function(redis_error, dog){
                    res.json({text: util.format('%s added to the fight.', commands[3])});
                });
            }
            else {
                res.json({text: "Add command not supported.  Run ```dogfight commands```"});
            }       
        } else { // remove
            if(type == "attack") {                        
                redis.addAttack(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "distraction") {
                redis.addDistraction(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "action"){
                redis.addAction(name, message, value,function(err, dog){
                    res.json({text: "Attack added."});
                });
            } else if(type == "dog") {
                redis.removeDog(commands[3], function(redis_error, dog){
                    res.json({text: util.format('%s removed from the fight.', commands[3])});
                });
            }
            else {
                res.json({text: "Remove command not supported.  Run ```dogfight commands```"});
            }       
        }        
    } else {
        res.json({text: "Command not found: \"/dogfight commands\" to list available commands."});
    }            
}