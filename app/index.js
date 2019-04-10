'use strict';
let R = require('ramda');
let teams = require('../data/teams.json').data;
let teamsPlayoffs = require('../data/teams_playoffs.json').data;

let players = require('../data/players.json').data;
let playersPlayoffs2016 = require('../data/players_playoffs_2016.json').data;
let playersPlayoffs2017 = require('../data/players_playoffs_2017.json').data;
let playersPlayoffs2018 = require('../data/players_playoffs_2018.json').data;
let playerGroupings = require('../data/players_groupings');

let playerData = [];
let playoffPointsBoost = 2;

class Base {
  constructor() {
		this.regular = {};
		this.playoff = {
      2016: {},
      2017: {},
      2018: {}
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
    this.regular.pointsPerGame = player.regular[2019].pointsPerGame;
    this.playoff.seasons = 0;
    let totalPlayoffPointsPerGame = 0;
    
    if (player.playoff[2018]) {
      this.playoff.seasons++;
      totalPlayoffPointsPerGame += player.playoff[2018].pointsPerGame;
      this.playoff[2018].pointsPerGame = player.playoff[2018].pointsPerGame;
    }
    
    if (player.playoff[2017]) {
      this.playoff.seasons++;      
      totalPlayoffPointsPerGame += player.playoff[2017].pointsPerGame;      
      this.playoff[2017].pointsPerGame = player.playoff[2017].pointsPerGame;
    }
    
    if (player.playoff[2016]) {
      this.playoff.seasons++;      
      totalPlayoffPointsPerGame += player.playoff[2016].pointsPerGame;      
      this.playoff[2016].pointsPerGame = player.playoff[2016].pointsPerGame;
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
		aggPlayer.regular[2019] = player;
		aggPlayer.playoff[2018] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2018);
		aggPlayer.playoff[2017] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2017);
		aggPlayer.playoff[2016] = R.find(R.propEq('playerId', player.playerId))(playersPlayoffs2016);
    
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



