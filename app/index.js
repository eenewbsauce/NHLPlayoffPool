'use strict';
let R = require('ramda');
let teams = require('../data/teams.json').data;
let teamsPlayoffs = require('../data/teams_playoffs.json').data;

let players = require('../data/players.json').data;
let playersPlayoffs2013 = require('../data/players_playoffs_2013.json').data;
let playersPlayoffs2014 = require('../data/players_playoffs_2014.json').data;
let playersPlayoffs2015 = require('../data/players_playoffs_2015.json').data;
let playerGroupings = require('../data/players_groupings');

let playerData = [];
let playoffPointsBoost = 2;

class Base {
  constructor() {
		this.regular = {};
		this.playoff = {
      2013: {},
      2014: {},
      2015: {}
    };		
	}
}

class AggregatePlayer extends Base {
  constructor(player) {
    super();
    this.playerFirstName = player.playerFirstName;
    this.playerLastName = player.playerLastName;
    this.teamAbbrev = player.playerTeamsPlayedFor;
  }
}

class ComputedValues extends Base {
  constructor(player) {
    super();
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
      this.effectivePointsPerGame = (this.playoff.pointsPerGame * playoffPointsBoost + this.regular.pointsPerGame) / 2;
    } else {
      this.effectivePointsPerGame = this.regular.pointsPerGame;
    }
  }
}

(function main() {
	aggregatePlayerData();
  calculatePointsPerGame();
  assignAggregatePlayersToPlayerGroupings();
  pickPlayerFromEachGroup();
})()

function aggregatePlayerData() {
	players.forEach(player => {
		let aggPlayer = new AggregatePlayer(player);    
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

function assignAggregatePlayersToPlayerGroupings() {
  let groupKeys = R.keys(playerGroupings);
  
  groupKeys.forEach(key => {
    playerGroupings[key].forEach(player => {
      let playerMatch = R.find(pd => {
        return player.playerFirstName === pd.playerFirstName &&
          player.playerLastName === pd.playerLastName;
          //&&
          // player.teamAbbrev === pd.teamAbbrev;
      })(playerData);
      
      player.aggregatePlayer = playerMatch;
    });
  });
}

function pickPlayerFromEachGroup() {
  let groupKeys = R.keys(playerGroupings);
  R.map(key => {
   let sortedPlayers = R.sort((a, b) => {
      return b.aggregatePlayer.computedValues.effectivePointsPerGame - a.aggregatePlayer.computedValues.effectivePointsPerGame;
    }, playerGroupings[key])
    
    console.log(`${key}:${sortedPlayers[0].playerFirstName} ${sortedPlayers[0].playerLastName}`)
  }, groupKeys);
}



