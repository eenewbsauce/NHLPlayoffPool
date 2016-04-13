'use strict';
let R = require('ramda');
let teams = require('../data/teams.json').data;
let teamsPlayoffs = require('../data/teams_playoffs.json').data;

let players = require('../data/players.json').data;
let playersPlayoffs2013 = require('../data/players_playoffs_2013.json').data;
let playersPlayoffs2014 = require('../data/players_playoffs_2014.json').data;
let playersPlayoffs2015 = require('../data/players_playoffs_2015.json').data;

let playerData = [];
let playoffPointsBoost = 2;

class AggregatePlayer {
	constructor() {
		this.regular = {};
		this.playoff = {};		
	}
}

(function main() {
	aggregatePlayerData();
  calculatePointsPerGame();
})()

function aggregatePlayerData() {
	players.forEach(player => {
		let aggPlayer = new AggregatePlayer();    
		aggPlayer.regular[2016] = player;
		aggPlayer.playoff[2015] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2015);
		aggPlayer.playoff[2014] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2014);
		aggPlayer.playoff[2013] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2013);
    
    playerData.push(aggPlayer);       		
	});    
}

function calculatePointsPerGame() {
  playerData.forEach(player => {
      
  });  
}




