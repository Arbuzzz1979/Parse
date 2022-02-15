const colors = require("colors");
const fs = require("fs");
const path = require("path");
const dirData = path.join(__dirname, '../data');
const dirStatsReferee = path.join(__dirname, '../data/stats/referee');
const dirStatsFouls = path.join(__dirname, '../data/stats/fouls');


// Load services
const parse = require("./services");
const utils = require("./utils");

// Load list of champioships
const champs = require("../constants/champ-list");

const { 
  createCurrentResults, 
  createStatsReferee
} = require("./locals");

// Load models
const TodayMatches = require('../models/today-matches')
const Fixtures = require('../models/fixtures') 
const LatestScores = require('../models/latest-scores') 
const Results = require('../models/results')
const Standings = require('../models/standings')
const Summary = require('../models/summary')
const Matches = require('../models/matches')  
const RefsStats = require('../models/refs-stats')
const RefsSummary = require('../models/refs-summary')
const FoulsStats = require('../models/fouls-stats')
const FoulsSummary = require('../models/fouls-summary')

const latestMatches = async (latest_scores) => {
  let statsObj = {};
  let awardedId = [];

  // Fix awarded matches
  latest_scores.forEach(score=>{
    score.matches.forEach(match=>{
      if (match.status==="Awarded") awardedId.push(match.matchId)
    })
  })
  
  // All match id from latest matches list
  const latestMatchesId = utils.getMatchesId(latest_scores).filter(r=>!awardedId.some(id => r.includes(id)))
  
  console.time("matches_logo time"); 
  const matches_logo = await parse.matches_logo(latestMatchesId);
  console.timeEnd("matches_logo time");
 
  console.time("matches_odds time"); 
  const matches_odds = await parse.matches_odds(latestMatchesId);
  console.timeEnd("matches_odds time"); 

  console.time("match_summary time"); 
  const summary = await parse.match_summary(latestMatchesId);
  console.timeEnd("match_summary time"); 

  console.time("base_stats_score_info time"); 
  const { base_stats, base_score, base_info } = await parse.base_stats_score_info(latestMatchesId);
  console.timeEnd("base_stats_score_info time"); 

  console.time("detailed_stats time"); 
  const det_stats = await parse.detailed_stats(latestMatchesId);
  console.timeEnd("detailed_stats time"); 

  Object.keys(base_stats).forEach((matchId) => {
    statsObj[matchId] = { ...base_stats[matchId], ...det_stats[matchId] };
  });

  return utils.combineLatestMatches(
    latest_scores,
    matches_logo, 
    matches_odds,
    summary,
    statsObj,
    base_score,
    base_info,
  )   
}

const parsing_league_matches = async (champ) => {
  let statsObj = {};
  let stats_by_match_id = {};
  const leagueId = champ.id

  console.time("today_matches time");
  const today_matches = await TodayMatches.find({id:leagueId});
  console.timeEnd("today_matches time");

  console.time("fixtures time");
  const fixtures = await Fixtures.find({id:leagueId});
  console.timeEnd("fixtures time");

  // Combine matches id 
  const matchesId = [...utils.getMatchesId(today_matches),...utils.getMatchesId(fixtures)];
  
  const all_matches_info = utils.combineAllMatches(today_matches, fixtures); 
  
  console.time("h2h time");
  const h2h = await parse.head_to_head(matchesId);
  console.timeEnd("h2h time");
  
  const lastMatchesId = [...new Set(h2h.map((matchId) => Object.values(matchId).map((m) => utils.getMatchesId(m)).flat()).flat())];
  console.time("summary time");
  const summary = await parse.match_summary(lastMatchesId);
  console.timeEnd("summary time");

  console.time("base_stats time");
  const { base_stats, base_score, base_info } = await parse.base_stats_score_info(lastMatchesId);
  console.timeEnd("base_stats time");

  console.time("det_stats time");
  const det_stats = await parse.detailed_stats(lastMatchesId);
  console.timeEnd("det_stats time");

  Object.keys(base_stats).forEach((matchId) => {
    statsObj[matchId] = { ...base_stats[matchId], ...det_stats[matchId] };
  });

  // Object.keys(base_stats).forEach((matchId) => {
  //   if (base_stats[matchId] !== "no data") statsObj[matchId] = { ...base_stats[matchId] }
  //   if (det_stats[matchId] !== "no data") statsObj[matchId] = { ...statsObj[matchId], ...det_stats[matchId] };
  // });

  console.time("odds time");
  const odds = await parse.matches_odds(lastMatchesId);
  console.timeEnd("odds time");
  
  h2h.forEach((matchId) =>
    Object.entries(matchId).map(([key, value]) => {
      stats_by_match_id[key] = value.map((s) => {
        return {
          statsFor: s.statsFor,
          title: s.title,
          matches: s.matches.map((match) => {
            return {
              ...match,
              summary: {
                ...summary[match.matchId],
                ...base_score[match.matchId],
                ...base_info[match.matchId]
              },
              stats: statsObj[match.matchId],
              odds: odds[match.matchId],
            };
          }),
        };
      });
    })
  );

  const result = matchesId.map((id) => {
    return {
      matchId: id,
      matchInfo: all_matches_info[id],
      matchStats: stats_by_match_id[id]
    };
  });

  return result
}  

exports.parsing_schedule = async () =>{
  // Parse Today matches
  console.time("today_matches time");
  const today_matches = await parse.today_matches();
  console.timeEnd("today_matches time");
  
  // All match id from today matches list
  console.time("todayMatchesId time");
  const todayMatchesId = utils.getMatchesId(today_matches)
  console.timeEnd("todayMatchesId time");

  console.log("todayMatchesId", todayMatchesId);
  
  // Parse Fixtures and Latest Scores  
  console.time("fixtures time"); 
  const {
    fixtures, 
    latest_scores
  } = await parse.fixtures_scores(todayMatchesId);
  console.timeEnd("fixtures time");
  
  // Combine matches id 
  const matchesId = [...todayMatchesId,...utils.getMatchesId(fixtures)];
  
  // Parse matches information by ID
  console.time("matches_logo time"); 
  const matches_logo = await parse.matches_logo(matchesId);
  console.timeEnd("matches_logo time");

  console.time("matches_info time"); 
  const matches_info = await parse.matches_info(matchesId);
  console.timeEnd("matches_info time");

  console.time("matches_odds time"); 
  const matches_odds = await parse.matches_odds(matchesId);
  console.timeEnd("matches_odds time");
  // Combine matches information
  const today_matches_info = utils.combineMatches(today_matches, matches_info, matches_odds,matches_logo)
  const fixtures_info = utils.combineMatches(fixtures, matches_info, matches_odds, matches_logo)

  console.time("latest_scores_info time"); 
  const latest_scores_info = await latestMatches(latest_scores)
  console.timeEnd("latest_scores_info time");
  
  try {
    await TodayMatches.deleteMany()
    await Fixtures.deleteMany()   
    await LatestScores.deleteMany()
    await Matches.deleteMany() 
   
    if (today_matches_info.length > 0) await TodayMatches.create(today_matches_info)
    if (latest_scores_info.length > 0) await LatestScores.create(latest_scores_info) 
    if (fixtures_info.length > 0) await Fixtures.create(fixtures_info) 

    console.log('Schedule data saved to Dadabase'.green.inverse)

  } catch (err) {
    console.error(err)
  }  
}

exports.parsing_standing = async ()=>{

  console.time("standings time"); 
  const result = await parse.standings(champs);
  console.timeEnd("standings time");

  console.log('Standings object created'.green.inverse);
  
  try {
    await Standings.deleteMany()
    await Standings.create(result)
    console.log('Data saved to Dadabase'.green.inverse)
    
  } catch (err) {
    console.error(err)
  }  
}

exports.parsing_results = async () =>{
  let results = [];
  for(const champ of champs) {
    if (champ.country === "Europe") continue 

    console.time("matches_result time"); 
    results.push(await parse.matches_result(champ))
    console.timeEnd("matches_result time");

    console.log(`Object done for ${champ.league}`.blue)
  }
  const matches_result_info = await latestMatches(results)

  let summary_by_champ = matches_result_info.map(champ=>{
    let minusMatch=0;
    let champStats =  champ.matches.reduce((acc, match, idx)=>{
      // Awarded matches ...
      if (match.status!=="Finished") {
        minusMatch = minusMatch + 1
        return acc
      }
      
      const stats = utils.getMatchSummaryStats(match.stats)
      for (let key in stats) {
        acc[key] = acc[key]? acc[key] + stats[key] : stats[key]
      }
      return acc
    },{}) 

    for (let key in champStats) {
      champStats[key]=(champStats[key]/(champ.matches.length-minusMatch)).toFixed(2)
    }

    return { 
      id: champ.id, 
      num: champ.num,
      country: champ.country,
      league: champ.league,
      champStats }
  })

  console.log("summary_by_champ",summary_by_champ)

  try {
    await Results.deleteMany()
    await Summary.deleteMany()
    
    if (matches_result_info.length > 0) await Results.create(matches_result_info)
    await Summary.create(summary_by_champ)

    console.log('Results data saved to Dadabase'.green.inverse)
  } catch (err) {
    console.error(err)
  }    
}

exports.parsing_matches = async () => {
  for(const champ of champs) {
    console.time("parsing_league_matches time");
    const matches_stats = await parsing_league_matches(champ)
    console.timeEnd("parsing_league_matches time");

    try {
      await Matches.create(matches_stats)
      console.log(`Data for ${champ.league} saved to Dadabase`.green.inverse)
    } catch (err) {
      console.error(err)
    }  
  }
}

exports.parsing_referees = async () => {
  let refsStats=[];

  const refsStatsWithNextMatch = (refsStats, fixtures, champ)=>{
    return refsStats.map(ref=>{
      let nextMatch = fixtures.matches.filter(match=>match.referee.split(" (")[0] === ref.name).toObject()
      if (!nextMatch[0]) return ref
      
      return {...ref, nextMatch: {...nextMatch[0], country: champ.country, champId: champ.id}}
    })
  }

  for(const champ of champs) {
    if (!champ.top) continue 
    const fixtures = await Fixtures.find({id:champ.id})
    const champRefsStats = JSON.parse(
      fs.readFileSync(path.join(dirStatsReferee, `${champ.id}.json`), 'utf-8'))

    refsStats.push({
      id: champ.id,
      country: champ.country,
      league: champ.league,
      num: champ.num,
      refsStats: refsStatsWithNextMatch(champRefsStats, fixtures[0], champ)
    })
  }    

  const summary = utils.createRefsSummary(refsStats)

  try {
    await RefsStats.deleteMany()
    await RefsSummary.deleteMany()
    await RefsStats.create(refsStats)
    await RefsSummary.create(summary)
    console.log('Referees Statistics Data Saved'.green.inverse)
    // process.exit()
  } catch (err) {
    console.error(err)
  }
}

exports.parsing_fouls = async () => {
  let foulsStats=[];

  for(const champ of champs) {
    if (!champ.top) continue 
    
    const champFoulsStats = JSON.parse(
      fs.readFileSync(path.join(dirStatsFouls, `${champ.id}.json`), 'utf-8'))

    foulsStats.push({
      id: champ.id,
      country: champ.country,
      league: champ.league,
      num: champ.num,
      foulsStats: champFoulsStats
    })
  }    

  const summary = utils.createFoulsSummary(foulsStats)

  // fs.writeFileSync(path.join(dirStatsFouls, `foulsStats.json`), JSON.stringify(foulsStats));   

  try {
    await FoulsStats.deleteMany()
    await FoulsSummary.deleteMany()
    await FoulsStats.create(foulsStats)
    await FoulsSummary.create(summary)
    console.log('Fouls Statistics Data Saved'.green.inverse)
    // process.exit()
  } catch (err) {
    console.error(err)
  }
}


if (process.argv[2] === '-dev') {parsing_fouls()}