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

class Base {
  constructor() {
		this.regular = {};
		this.playoff = {};		
	}
}

class AggregatePlayer extends Base {	
}

class ComputedValues extends Base {
  constructor(player) {
    this.regular.pointsPerGame = player.regular[2016].pointsPerGame;
    this.playoff.seasons = 0;
    let totalPlayoffPointsPerGame = 0;
    
    if (player.playoff[2015]) {
      this.playoff.seasons++;
      totalPlayoffPointsPerGame += player.playoff[2015].pointsPerGame;
      this.playoff[2015].pointsPerGame = player.playoff[2015].pointsPerGame;
    }
    
    if (player.playoff[2014]) {
      this.playoff.seasons++;      
      totalPlayoffPointsPerGame += player.playoff[2014].pointsPerGame;      
      this.playoff[2014].pointsPerGame = player.playoff[2014].pointsPerGame;
    }
    
    if (player.playoff[2013]) {
      this.playoff.seasons++;      
      totalPlayoffPointsPerGame += player.playoff[2013].pointsPerGame;      
      this.playoff[2013].pointsPerGame = player.playoff[2013].pointsPerGame;
    }
    
    if (this.playoffsPlayed > 0) {
      this.playoff.pointsPerGame = totalPlayoffPointsPerGame / this.playoff.seasons;
    }
  }
}

(function main() {
	aggregatePlayerData();
  calculatePointsPerGame();
  pickPlayerFromEachGroup();
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
    player.computedValues = new ComputedValues(player);    
  });  
}

function pickPlayerFromEachGroup() {
  
}



