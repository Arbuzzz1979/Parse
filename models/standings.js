const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const StandingsSchema = new Schema({
  country: String,
  league: String,
  id: String,
  standings: {
    info: String,
    overall: [
      {
      rank : String,
      teamName: String,
      teamId: String,
      teamLogo: String,
      matchesPlayed: String,
      wins: String,
      draws: String,
      losses: String,
      goals: String,
      points: String,
      positionTeam: String,
      positionCode: String,
      nextMatch: {
        title: String,
        matchDate: String,
        matchId: String,
      }
      }
    ],
    home: [
      {
        rank : String,
        teamName: String,
        teamId: String,
        teamLogo: String,
        matchesPlayed: String,
        wins: String,
        draws: String,
        losses: String,
        goals: String,
        points: String,
        positionInfo: String,
        nextMatch: {
          title: String,
          matchDate: String,
          matchId: String,
        }
        }      
    ],
    away: [
      {
        rank : String,
        teamName: String,
        teamId: String,
        teamLogo: String,
        matchesPlayed: String,
        wins: String,
        draws: String,
        losses: String,
        goals: String,
        points: String,
        positionInfo: String,
        nextMatch: {
          title: String,
          matchDate: String,
          matchId: String,          
        }
        }      
    ]
  }
});  


module.exports =
    mongoose.models.Standings || mongoose.model('Standings', StandingsSchema);
    
