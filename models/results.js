const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const ResultsSchema = new Schema({
  id: String,
  country: String,
  league: String,
  num: String,
  logo: String,
  matches: [{
    matchId: String,
    matchFullDate: String,
    matchData: String,
    matchTime: String,
    timestamp: String,
    round: String,
    homeTeam: String,
    awayTeam: String,
    homeTeamIco: String,
    awayTeamIco: String,
    homeTeamShortName: String,
    awayTeamShortName: String, 
    matchLogo: String, 
    summary:{
      duration: String,
      winner: String,
      scoreFinal:{
        homeTeam: String,
        awayTeam: String,
      },
      score90min:{
        homeTeam: String,
        awayTeam: String,
      },
      scoreFirstHalf:{
        homeTeam: String,
        awayTeam: String,
      },
      scoreSecondHalf:{
        homeTeam: String,
        awayTeam: String,
      },
      scoreExtraTime:{
        homeTeam: String,
        awayTeam: String,
      },
      scorePenalties:{
        homeTeam: String,
        awayTeam: String,
      },
      referee: String,
      venue: String,
    },
    stats: {
      ballPossession: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      goalAttempts: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      shotsOnGoal: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      cornerKicks: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      offsides: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      throwIns: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      fouls: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
      },
      yellowCards: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        minutes: {
          homeTeam: [],
          awayTeam: [],            
        }
      },
      redCards: {
        event: {
          type: String,
          enum: ['yes', 'no', 'no data']
        },              
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        minutes: {
          homeTeam: [],
          awayTeam: [],            
        }              
      },
      goals: {
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        minutes: {
          homeTeam: [],
          awayTeam: [],            
        },
        time1stGoal: String,
        bothScore: String,
        goalIn1Half: String,
        goalIn2Half: String,
        scoreBothHalves: String,                
      },
      penalties: {
        event: {
          type: String,
          enum: ['yes', 'no', 'no data']
        },
        match: {
          homeTeam: String,
          awayTeam: String,
        },
        firstHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        secondHalf: {
          homeTeam: String,
          awayTeam: String,
        },
        minutes: {
          homeTeam: [],
          awayTeam: [],            
        }              
      },
    },    
    odds: {
      w: String,
      d: String,
      l: String,
    },    
    }]
});

ResultsSchema.pre('save', function(next){
  this.league = this.league.split(": ")[1]
  next()
})

module.exports =
    mongoose.models.Results || mongoose.model('Results', ResultsSchema);