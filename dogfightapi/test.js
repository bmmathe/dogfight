var util = require('util');
var text = 'dogfight add attack Lola "lunges at" "throat" -20';
var commands = text.split(' ');
var attack = text.split('"');
console.log(util.format('Command: %s',commands[1]));
console.log(util.format('Action: %s',commands[2]));
console.log(util.format('Verb: %s', attack[1]));
console.log(util.format('Noun: %s', attack[3]));
console.log(util.format('Value: %s', attack[4].trim()));