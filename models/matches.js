const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const MatchesSchema = new Schema({
  matchId: String,
  matchInfo: {
    matchData: String,
    matchTime: String,
    homeTeam: String,
    awayTeam: String,
    homeTeamIco: String,
    awayTeamIco: String,
    referee: String,
    venue: String,
    odds: {
      w: String,
      d: String,
      l: String,
    },    
    homeTeamShortName: String,
    awayTeamShortName: String,   
    matchLogo: String,
  },
  matchStats: [
    {
      statsFor: String,
      title: String,
      matches: [
        {
          matchId: String,
          fullDate: String,
          matchData: String,
          matchTime: String,
          league: String,
          country: String,
          flag: String,
          status: String,
          homeTeam: String,
          awayTeam: String,
          homeTeamShortName: String,
          awayTeamShortName: String, 
          score: String,
          tooltip: String,
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
          }
        },
      ],
    },
  ],
});

module.exports =
    mongoose.models.Matches || mongoose.model('Matches', MatchesSchema);