var redis = require("../data/redis.js");
var randomString = require("../utils/randomString");

module.exports = {
    start: start,
    queueFight: queueFight    
};

function start(req, res) {
    var dogs = req.body;
    if(dogs.length != 2) {
        res.status(400).json({message: "Must have only 2 dogs in a fight"});
        return;
    }
    queueFight(dogs);
    res.json({success: 1, description: "Fight queued"});
}

function queueFight(dogs) {
    var arenaId = randomString.generate(10);
    redis.queueFight(dogs, arenaId);
}