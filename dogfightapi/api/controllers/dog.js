var redis = require("../data/redis.js");
var util = require('util');

module.exports = {
    addDog: addDog,
    getDog: getDog,
    removeDog: removeDog,
    getDogs: getDogs,
    getAttacks: getAttacks,
    addAttack: addAttack,
    getDistractions: getDistractions,
    addDistraction: addDistraction,
    getActions: getActions,
    addAction: addAction
};

function addDog(req, res) {
    redis.saveDog(req.body);    
    res.json({success: 1, description: "Added dog to fight"});
}

function getDog(req, res) {
    var name = req.swagger.params.name.value;
    redis.getDog(name, function(redis_error, dog) {
        if(!dog) {
            var notfound = util.format('%s not found', name);
            res.status(404).json({message: notfound});
        } else {
            res.json(dog);
        }
    });
}

function removeDog(req, res) {
    var name = req.swagger.params.name.value;
    redis.deleteDog(name, function(redis_error, success) {
        if(success < 1) {
            res.status(404).send({message: util.format('%s not found', name)});
        } else {
            var message = util.format('%s removed from fight', name);
            res.json({success: 1, description: message});
        }
    });
}

function getDogs(req, res) {
    redis.getAllDogs(function(redis_error, dogs) {
        res.json(dogs);
    });
}

function getAttacks(req, res) {
    var name = req.swagger.params.name.value;
    redis.getAttacks(name, function(redis_error, Attacks) {
        res.json(Attacks);
    });
}

function addAttack(req, res) {
    var name = req.swagger.params.name.value;
    redis.addAttack(name, req.body.message, req.body.value, function() {
        res.json({success: 1, description: "Attack added."});
    });
}

function getDistractions(req, res) {
    var name = req.swagger.params.name.value;
    redis.getDistractions(name, function(redis_error, distractions) {
        res.json(distractions);
    });
}

function addDistraction(req, res) {
    var name = req.swagger.params.name.value;
    redis.addDistraction(name, req.body.message, req.body.value, function() {
        res.json({success: 1, description: "Distraction added."});
    });
}

function getActions(req, res) {
    var name = req.swagger.params.name.value;
    redis.getActions(name, function(redis_error, actions) {
        res.json(actions);
    });
}

function addAction(req, res) {
    var name = req.swagger.params.name.value;
    redis.addAction(name, req.body.message, req.body.value, function() {
        res.json({success: 1, description: "Action added."});
    });
}