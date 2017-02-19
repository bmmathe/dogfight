# API for a playful dog fight game
The inspiration for this project came from me watching my new puppy play fight with my older dog in my backyard.
This project was created to experiment with Node, Swagger API, Redis, and Slack integration.
Slack Incoming Webhooks are used to send fight data to a Slack channel.
Slack Outgoing Webhooks are used to get data about dogs and start a fight.

## Install
npm Install

Update the config.js with your Redis instance and Slack incoming web hook

## Debug mode:
DEBUG=swagger-tools* 

## Starting the project
swagger project start

## Edit the Swagger YAML Spec
swagger project edit