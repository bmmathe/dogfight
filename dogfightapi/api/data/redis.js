var redis = require('redis');
var config = require('../../config.js');
var client = redis.createClient(6379, config.redis);
var util = require('util');
var outbound = require('../utils/outbound.js');

client.on('reconnecting', function (data) {
    console.log('reconnecting', JSON.stringify(data));    
});

client.on('error', function (err) {
    console.log(util.format('Redis error: %s', err));
});

client.on('ready', function () {
    console.log('Redis ready');
});


exports.saveDog = function(dog, callback) {
    client.set('dog:'+dog.name, JSON.stringify(dog), function(err, dog) {
        console.log(dog);
        callback(err, dog);
    });
}

exports.getDog = function(name,callback) {
    client.get('dog:'+name, function(err, data){
        if(err) {
            console.log("Error in getDog: " +JSON.stringify(err));
        }
        callback(err, JSON.parse(data));
    });
}

exports.putMove = function() {
    client.rpush(id, message);
}

exports.removeDog = function(name, callback) {
    client.del('dog:'+name, function(err, reply){
        if(err) {
            console.log(JSON.stringify(err));
        }
        callback(err, JSON.parse(reply));
    });
}

exports.getAllDogs = function(callback) {
    var dogs = [];
    var cursor = '0';
    client.scan(cursor, 'MATCH', 'dog:*', 'COUNT', '5', function(err, reply){
        console.log(reply[0]);
        console.log(reply[1]);

        for(var i = 0; i < reply[1].length; i++) {
            dogs.push(reply[1][i].replace('dog:',''));
        }

        cursor = reply[0];
        if(cursor === '0'){
            return callback(err, dogs);
        }else{          
            return scan();
        }
    });
}

exports.queueFight = function(dogs, arenaId) {
    client.rpush("fightQueue", JSON.stringify({arenaId: arenaId, dogs: dogs}));    
}

exports.listen = function() {
    var clientBlocking = client.duplicate();
    var blpopQueue = function(id) {        
        clientBlocking.blpop(id, 0, function(err, data) {            
            if(err) {
                outbound.send(util.format('Redis blpop error: %s', err));
                setTimeout(blpopQueue, 1000, id); // connect back to queue
                return;
            }
            var fight = JSON.parse(data[1]);            
            module.exports.getDog(fight.dogs[0], function(err1, dog1) {
                module.exports.getDog(fight.dogs[1], function(err2, dog2) {                    
                    startFight(dog1, dog2, fight.arenaId);
                });
            });

            setTimeout(blpopQueue, 1000, id);        
        });
    }
    blpopQueue("fightQueue");
}

function startFight(dog1, dog2, arenaId) {
    console.log(util.format('%s fighting %s in arena %s', dog1.name, dog2.name, arenaId));
    dog1.hp = dog1.weight;
    dog2.hp = dog2.weight;
    var dogs = [dog1, dog2];
    
    console.log('%s hp is %s', dogs[0].name, dogs[0].hp);
    console.log('%s hp is %s', dogs[1].name, dogs[1].hp);

    var turn = 1;
    takeTurn(dogs, turn);    
}

function takeTurn(dogs, turn) {
    var message = '';        
    var actionType = Math.floor((Math.random() * 100) + 1);
    var action = {};
    if(actionType >= 50) {     
        action = dogs[turn].attacks[Math.floor((Math.random() * dogs[turn].attacks.length))];                
        dogs[(turn+1)%2].hp += action.value;
        message = util.format('%s %s (%s)',action.message.replace("{0}", dogs[turn].name).replace("{1}", dogs[(turn+1)%2].name), action.value, dogs[(turn+1)%2].hp);
        console.log(message);
        //console.log(util.format('%s hp is %s', dogs[(turn+1)%2].name, dogs[(turn+1)%2].hp));
    } else if(actionType >= 25) {        
        action = dogs[turn].distractions[Math.floor((Math.random() * dogs[turn].distractions.length))];                       
        dogs[turn].hp += action.value;
        message = util.format('%s %s (%s)', action.message.replace("{0}", dogs[turn].name).replace("{1}", dogs[(turn+1)%2].name), action.value, dogs[turn].hp);
        console.log(message);
        //console.log(util.format('%s hp is %s', dogs[turn].name, dogs[turn].hp));
    } else {
        action = dogs[turn].actions[Math.floor((Math.random() * dogs[turn].actions.length))];                
        dogs[turn].hp += action.value;
        message = util.format('%s %s (%s)', action.message.replace("{0}", dogs[turn].name).replace("{1}", dogs[(turn+1)%2].name), action.value, dogs[turn].hp);
        console.log(message);
        //console.log(util.format('%s hp is %s', dogs[turn].name, dogs[turn].hp));
    }    

    outbound.send(message);

    setTimeout(function() {
        if(dogs[0].hp > 0 && dogs[1].hp > 0) {
            takeTurn(dogs, (turn+1)%2);
        } else {
            var winner = '';
            if(dogs[0].hp <= 0) {
                winner = dogs[1].name;                
            } else {
                winner = dogs[0].name;                
            }
            var winnerMsg = util.format('%s won!', winner);
            console.log(winnerMsg);
            outbound.send(winnerMsg);
        }
    }, 1000);
    
}

exports.getAttacks = function(name, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        callback(redis_error, dog.attacks);
    });
}

exports.addAttack = function(name, message, value, callback) {
    module.exports.getDog(name, function(redis_error, dog) {
        if(!dog.attacks) {
            dog.attacks = [];
        }
        dog.attacks.push({message: message, value: value});
        module.exports.saveDog(dog, function(saveDogError, data){
            callback(redis_error, dog);                    
        }); 
    });
}

exports.removeAttack = function(name, message, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        var attacks = dog.attacks.filter(function(e) {
            return e.message !== message;
        });
        if(redis_error) {
            callback(redis_eror, dog);
        } else {
            dog.attacks = attacks;
            module.exports.saveDog(dog, function(saveError, dog) {
                callback(saveError, dog);
            });
        }
    });
}

exports.getDistractions = function(name, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        callback(redis_error, dog.distractions);
    });
}

exports.addDistraction = function(name, message, value, callback) {
    module.exports.getDog(name, function(redis_error, dog) {
        if(!dog.distractions) {
            dog.distractions = [];
        }
        dog.distractions.push({message: message, value: value});
        module.exports.saveDog(dog, function(saveDogError, data){
            callback(redis_error, dog);                    
        }); 
    });
}

exports.removeDistraction = function(name, message, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        var distractions = dog.distractions.filter(function(e) {
            return e.message !== message;
        });
        if(redis_error) {
            callback(redis_eror, dog);
        } else {
            dog.distractions = distractions;
            module.exports.saveDog(dog, function(saveError, dog) {
                callback(saveError, dog);
            });
        }
    });
}

exports.getActions = function(name, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        callback(redis_error, dog.actions);
    });
}

exports.addAction = function(name, message, value, callback) {
    module.exports.getDog(name, function(redis_error, dog) {
        if(!dog.actions) {
            dog.actions = [];
        }
        dog.actions.push({message: message, value: value});
        module.exports.saveDog(dog, function(saveDogError, data){
            callback(redis_error, dog);                    
        }); 
    });
}

exports.removeAction = function(name, message, callback) {
    module.exports.getDog(name, function(redis_error, dog) {        
        var actions = dog.actions.filter(function(e) {
            return e.message !== message;
        });
        if(redis_error) {
            callback(redis_eror, dog);
        } else {
            dog.actions = actions;
            module.exports.saveDog(dog, function(saveError, dog) {
                callback(saveError, dog);
            });
        }
    });
}