var util = require('util');
var text = 'dogfight add attack Lola "{0} bites {1} on the nose." -20';
var commands = text.split(' ');
var attack = text.split('"');

for(var i = 0; i < attack.length; i++) {
    console.log(attack[i]);
}
console.log(util.format('Command: %s',commands[1]));
console.log(util.format('Action: %s',commands[2]));
console.log(util.format('Dog: %s', commands[3]));
console.log(util.format('Message: %s', attack[1]))
console.log(util.format('Value: %s', attack[2].trim()))