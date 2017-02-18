var redis = require('redis');
var client = redis.createClient(6379, '40.70.219.21');
var util = require('util');

exports.saveDog = function(dog) {
    client.set('dog:'+dog.name, JSON.stringify(dog));
}

exports.getDog = function(dogName,callback) {
    client.get('dog:'+dogName, function(err, reply){
        if(err) {
            console.log("Error in getDog: " +JSON.stringify(err));
        }
        callback(err, JSON.parse(reply));
    });
}

exports.putMove = function() {
    client.rpush(id, message);
}

exports.deleteDog = function(dogName, callback) {
    client.del('dog:'+dogName, function(err, reply){
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
                console.log("Error: " +err);
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
    dog1.hp = dog1.weight*2;
    dog2.hp = dog2.weight*2;
    var dogs = [dog1, dog2];
    
    console.log('%s hp is %s', dogs[0].name, dogs[0].hp);
    console.log('%s hp is %s', dogs[1].name, dogs[1].hp);

    var turn = 1;
    while(dogs[0].hp > 0 && dogs[1].hp > 0) {        
        var actionType = Math.floor((Math.random() * 3) + 1);
        var action = {};
        switch(actionType) {
            case 1:     
                action = dogs[turn].fight_moves[Math.floor((Math.random() * dogs[turn].fight_moves.length))];                
                dogs[(turn+1)%2].hp += action.value;               
                console.log(util.format('%s %s %s\'s %s : %s hp is %s', dogs[turn].name, action.verb, dogs[(turn+1)%2].name, action.noun, dogs[(turn+1)%2].name, dogs[(turn+1)%2].hp));
                break;
            case 2:
                action = dogs[turn].distractions[Math.floor((Math.random() * dogs[turn].distractions.length))];                       
                dogs[turn].hp += action.value;
                console.log(util.format('%s %s : %s hp is %s', dogs[turn].name, action.distraction, dogs[turn].name, dogs[turn].hp));
                break;
            case 3: 
                action = dogs[turn].actions[Math.floor((Math.random() * dogs[turn].actions.length))];                
                dogs[turn].hp += action.value;
                console.log(util.format('%s %s : %s hp is %s', dogs[turn].name, action.action, dogs[turn].name, dogs[turn].hp));
                break;
        }
        turn = (turn+1)%2;        
    }

    if(dogs[0].hp <= 0) {
        console.log(util.format('%s won', dogs[1].name));
    } else {
        console.log(util.format('%s won', dogs[0].name));
    }
}