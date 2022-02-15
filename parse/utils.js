const champs = require("../constants/champ-list");
const teamsAbbr = require("../constants/teams-abbr");
const matchCodes = require("../constants/match-codes");
const refereesInfo = require("../constants/referees-info");


// Filter record from champName
const checker = (value) => champs.some((element) => value.includes(element.title));
const champFilter = (inputData) => inputData.filter(checker);

// Matches Id
exports.getMatchesId = (matches) =>
  [... new Set(matches.map((record) => record.matches.map((match) => match.matchId)).flat())]

// Matches Id
exports.getOneLeagueMatchesId = (results) =>
[... new Set(results.matches.map((match) => match.matchId).flat())]

// Matches League Id
exports.getLeagueMatchesId = (matches,leagueId) =>
  matches.filter(f=>f.id===leagueId).map((record) => record.matches.map((match) => match.matchId)).flat()

// // Next Matches Id
// exports.getNextMatchesId = (standings) =>
//   [... new Set(standings.map((record) => record.standings.overall.map((match) => match.nextMatch.matchId)).flat())]

function convertMatchDate(unix_timestamp, format){
  let date = new Date(unix_timestamp * 1000);
  let year = date.getFullYear()
  let month = date.getMonth();
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
  if (format==="time") return hours + ':' + minutes.substr(-2)
  if (format==="date") return day + ' ' + monthNames[month]
  if (format==="year") return day + ' ' + monthNames[month] + ' ' + year
  if (format==="next") return day + ' ' + monthNames[month] + ' ' + year
}

/////////////////////////////
// Parsing schedule matches//
/////////////////////////////
 
// Create match object
const parse_match = (match)=>{
  return {
    matchId: match.AA,
    matchFullDate: convertMatchDate(match.AD, "year"),
    matchData: convertMatchDate(match.AD, "date"),
    matchTime: convertMatchDate(match.AD, "time"),
    timestamp: match.AD,
    // round: match.ER? +/\d+/.exec(match.ER) : null,
    round: match.ER? match.ER : null,
    status: matchCodes[match.AC],
    homeTeam: match.CX,
    awayTeam: match.AF,
    homeTeamIco: match.OA,
    awayTeamIco: match.OB,
    homeTeamShortName: match.WM,
    awayTeamShortName: match.WN,
  };
}

const getSchedule = (data) => {

  // Parse fields of championship name and ico
  let country = data.split("¬ZEE÷")[0].split(":")[0];
  let league = data.split("¬ZEE÷")[0];
  let id = data.split("¬ZB÷")[0].split("¬ZEE÷")[1];
  let num = data.split("¬ZY÷")[0].split("¬ZB÷")[1];
  let logo = data.split("¬ZX÷")[0].split("¬OAJ÷")[1]

  // Parse matches of championship 
  let matches = data.split("¬~").filter(r => r.includes("AA÷"))
    .map(r => r.split("¬"))
    .map(r => Object.fromEntries(r.map(r => [r.split("÷")[0], r.split("÷")[1]])))
    .map(r => parse_match(r))

    return { id, country, num, league, logo, matches }
};

exports.getScheduleMatches = (data) => {
  let champList = champFilter(data.split("¬~ZA÷"))
  return champList.map(c => getSchedule(c));
};

// Convert schedule matches
exports.convertScheduleMatches = (array) => {
  let list = new Map();
  let result=[];
  array.forEach(cur=>{
     if (cur.length>0){
       cur.forEach(league=>{
         if (list.has(league.id)) {
           let obj = list.get(league.id)
           obj.matches = [...obj.matches,...league.matches]
           list.set(league.id, obj)
         } else {
           list.set(league.id, league)
         }
       })
     }
  })

  for (let matches of list.values()) {
   result.push(matches); 
 }
 return result
}

////////////////////////
// Parsing match odds //
////////////////////////
const parse_odd = (odd) => {
  //fix bag on the source site
  if (!odd.XC) odd['XC']=odd['']
  
  let win = odd.XA?.includes("[")? odd.XA.split("]")[1] : odd.XA
  let draw = odd.XB?.includes("[")? odd.XB.split("]")[1] : odd.XB
  let lose = odd.XC?.includes("[")? odd.XC.split("]")[1] : odd.XC
  
  return { w: win, d: draw, l: lose};
};

const get_average_odd = (odds) => {
  let odd = odds.reduce((acc, b) => {
    acc["w"] = acc["w"] ? +acc["w"] + +b["w"] : +b["w"];
    acc["d"] = acc["d"] ? +acc["d"] + +b["d"] : +b["d"];
    acc["l"] = acc["l"] ? +acc["l"] + +b["l"] : +b["l"];
    return acc;
  }, {});
  
  for (let prop in odd) {
    odd[prop] = (odd[prop] / odds.length).toFixed(2);
  }
  
  return odd;
};

exports.createMatchOdds = (data,id) => {
  if (data === "no data") return "no odds"
  const statsParser = data.split("¬~OA÷")
                        .filter((r) => r.includes("1x2-odds") || r.includes("over-under"));
  const [match, firstHalf] = statsParser[0].split("¬~OB÷")
                                          .filter((r) => r.includes("bookmakers"));

  let odds = match.split("¬OD÷").filter((r) => r.includes("bookmakers"))
              .map((r) => r.split("¬"))
              .map((r) =>Object.fromEntries(r.map((r) => [r.split("÷")[0], r.split("÷")[1]])))
              .map((r) => parse_odd(r));

  return get_average_odd(odds);
};

exports.createMatchOddsObject = (data,id) => {
  let odds = data.split("]}¬MJ")[0].split(":[")[1].replace(/"/g,"").split(",")
  return { w: odds[0], d: odds[1], l: odds[2]};
};

///////////////////////////////////////
// Parsing base stats for each match //
///////////////////////////////////////
const createBaseStatsObject = (data, ext="") => {
  if (data.length < 2) return "no data"
  let firstHalf = data[0]
  let secondHalf = data[1]
  let match = [...data[0],...data[1]]
  let event;

  let HTfirstHalf = firstHalf.filter(r=>r.includes("IA÷1")).length || 0
  let HTsecondHalf = secondHalf.filter(r=>r.includes("IA÷1")).length || 0
  let ATfirstHalf = firstHalf.filter(r=>r.includes("IA÷2")).length || 0 
  let ATsecondHalf = secondHalf.filter(r=>r.includes("IA÷2")).length || 0
 
  let HTminutes = match.filter(r=>r.includes("IA÷1")).map(minute=>minute.split("IB÷")[1].split("¬")[0])
  let ATminutes = match.filter(r=>r.includes("IA÷2")).map(minute=>minute.split("IB÷")[1].split("¬")[0])

  let result = {
    match: {
      homeTeam: HTfirstHalf+HTsecondHalf,
      awayTeam: ATfirstHalf+ATsecondHalf,
    },
    firstHalf: {
      homeTeam: HTfirstHalf,
      awayTeam: ATfirstHalf,
    },
    secondHalf: {
      homeTeam: HTsecondHalf,
      awayTeam: ATsecondHalf,
    },
    minutes: {
      homeTeam: HTminutes,
      awayTeam: ATminutes,            
    }
  }

  
  if (ext==="goals") {
    let matchScoreHT = parseInt(HTfirstHalf) + parseInt(HTsecondHalf),
        matchScoreAT = parseInt(ATfirstHalf) + parseInt(ATsecondHalf),
        firstHalfScore = parseInt(HTfirstHalf) + parseInt(ATfirstHalf),
        secondHalfScore = parseInt(HTsecondHalf) + parseInt(ATsecondHalf),
        time1stGoal = [...HTminutes, ...ATminutes].map(min=>parseInt(min)).sort()[0];

    result.time1stGoal = time1stGoal? time1stGoal + "'" :null
    result.bothScore = (matchScoreHT > 0 && matchScoreAT > 0)? "yes": "no"
    result.goalIn1Half = (firstHalfScore > 0)? "yes": "no"
    result.goalIn2Half = (secondHalfScore > 0)? "yes": "no"
    result.scoreBothHalves = (firstHalfScore > 0 && secondHalfScore > 0)? "yes": "no"
  }

  if (ext==="yesno") {
    let total = HTfirstHalf+HTsecondHalf+ATfirstHalf+ATsecondHalf
    result.event = (total>0)? "yes" : "no"
  }
 
  return result
};

exports.getMachesBaseStats = (data) => {
  // if (data==="") return {yellowCards: "no data", redCards: "no data", goals: "no data", penalties: "no data"};

  const halfParser = data.split("~AC÷");
  const statsParser = halfParser.map(data=>data.split("~III÷").filter(r => r.includes("¬IA÷")))
  
  const yellowCard = statsParser.map(data=>data.filter(r => r.includes("Yellow Card")))
  const redCard = statsParser.map(data=>data.filter(r => r.includes("Red Card")))
  const goal = statsParser.map(data=>data.filter(r => r.includes("IK÷Goal¬") 
                                                      || r.includes("IK÷Own goal¬") 
                                                      || r.includes("IK÷Penalty¬")))
  const penalty = statsParser.map(data=>data.filter(r => r.includes("Penalty Kick")))
  
  return {
    yellowCards:  createBaseStatsObject(yellowCard),
    redCards: createBaseStatsObject(redCard,"yesno"),
    goals: createBaseStatsObject(goal,"goals"),
    penalties: createBaseStatsObject(penalty,"yesno"),
  };
};

//////////////////////////////////////
// Parsing exp stats for each match //
//////////////////////////////////////

const createObjHomeAway = (inputData) => {
  let awayTeam = inputData.split("¬SI÷")[1]
  if (awayTeam.includes("¬")) {
    awayTeam=awayTeam.split("¬")[0]
  }
  return {
    homeTeam: inputData.split("¬SI÷")[0],
    awayTeam,
  };
};
const matchStats = (inputData, string) => {
  if (!inputData) return "";
  let obj = {};
  inputData.map((part, idx) => {
    const keys = ["match", "firstHalf", "secondHalf"];
    const record = part.split("¬~SG÷").filter((r) => r.includes(string))[0];
    
    if (record) {
      obj = { ...obj, [keys[idx]]: createObjHomeAway(record.split("¬SH÷")[1]) };
    } else {
      obj = { ...obj, [keys[idx]]: { homeTeam: "no data", awayTeam: "no data" } };
    }
  });
  return obj;
};

exports.getExpMachesStats = (data) => {
  // if (data === "")  return {
  //   ballPossession: "no data",
  //   goalAttempts: "no data",
  //   shotsOnGoal: "no data",
  //   cornerKicks: "no data",
  //   offsides: "no data",
  //   throwIns: "no data",
  //   fouls: "no data"
  // }

  const statsParser = data.split("SE÷").filter(r => r.includes("¬~SG÷"));

  return {
    ballPossession: matchStats(statsParser, "Ball Possession"),
    goalAttempts: matchStats(statsParser, "Goal Attempts"),
    shotsOnGoal: matchStats(statsParser, "Shots on Goal"),
    cornerKicks: matchStats(statsParser, "Corner Kicks"),
    offsides: matchStats(statsParser, "Offsides"),
    throwIns: matchStats(statsParser, "Throw-in"),
    fouls: matchStats(statsParser, "Fouls"),
  };
};

//////////////////////////
// Parsing last matches //
//////////////////////////
const teamTitle = (data) => {
  return data.split("¬KP÷")[0].split(":")[1].split("¬~KC÷")[0] 
 }

const lastMatches = (data) => {
 let record = data.split("¬")
 let obj = Object.fromEntries(record.map(r => [r.split("÷")[0], r.split("÷")[1]]))
 // let homeTeam = obj.KJ.replace(/[^a-zа-яё\s]/gi, '').trim()
 // let awayTeam = obj.KK.replace(/[^a-zа-яё\s]/gi, '').trim()
 let homeTeam = obj.KJ.replace("*", '').trim()
 let awayTeam = obj.KK.replace("*", '').trim()
 let homeTeamShortName = teamsAbbr[homeTeam]? teamsAbbr[homeTeam] : homeTeam.slice(0,3).toUpperCase()
 let awayTeamShortName = teamsAbbr[awayTeam]? teamsAbbr[awayTeam] : awayTeam.slice(0,3).toUpperCase()
 
 let tooltip = `${homeTeam} ${obj.KL} ${awayTeam}`

 return {
   matchId: obj.KP,
   fullDate: convertMatchDate(obj.KC, "year"),
   matchData: convertMatchDate(obj.KC, "date"),
   matchTime: convertMatchDate(obj.KC, "time"),    
   league: obj.KF,
   country: obj.KH,
   flag: `fl_${obj.KG}`,
   status: obj.KI,
   homeTeam,
   awayTeam,
   homeTeamShortName,
   awayTeamShortName,
   score: obj.KL,
   tooltip
 };
};

const lastMatchesInfo = (data) =>
 data.split("¬~").filter((r) => r.includes("KC÷"));

exports.getLastMatches = (data,idx) => {
 
 let teamParser = data.split("¬~KB÷").filter(r => r.includes("¬~KC÷"))
 
 return [
   {
     statsFor: "homeTeam",
     title: teamTitle(teamParser[0]),
     matches: lastMatchesInfo(teamParser[0]).map((info,idx) => lastMatches(info)).filter(f=>f.league!=="Club Friendly"),
   },
   {
     statsFor: "awayTeam",
     title: teamTitle(teamParser[1]),
     matches: lastMatchesInfo(teamParser[1]).map((info) => lastMatches(info)).filter(f=>f.league!=="Club Friendly"),
   },
   {
     statsFor: "h2h",
     title: `${teamTitle(teamParser[0])} - ${teamTitle(teamParser[1])}`,
     matches: lastMatchesInfo(teamParser[2]).map((info) => lastMatches(info)).filter(f=>f.league!=="Club Friendly"),
   },
 ];
};



//////////////////////////////////////
// Combine data object //
//////////////////////////////////////
exports.combineMatches = (matches, matches_info, matches_odds, matches_logo) => {
  return matches.map(league=>{
    return {
      ...league,
      matches: league.matches.map(match=>{
        return {
          ...match,
          matchLogo: matches_logo[match.matchId],
          referee: matches_info[match.matchId].referee,
          venue: matches_info[match.matchId].venue,
          odds: matches_odds[match.matchId]
        }
      })
    }
  })
};

exports.combineAllMatches = (today_matches, fixtures) => {
    let result = {}
    const matches = [
      ...today_matches.map(t=>t.matches),
      ...fixtures.map(f=>f.matches)
    ].flat()
    matches.forEach(match=>{
      result[match.matchId] = match
    })
    return result
}

exports.combineLatestMatches = (
    matches, 
    matches_logo, 
    matches_odds,
    summary,
    statsObj,
    base_score,
    base_info
  ) => {

  return matches.map(league=>{
    return {
      ...league,
      matches: league.matches.map(match=>{
        return {
          ...match,
          matchLogo: matches_logo[match.matchId],
          summary: {
            ...summary[match.matchId],
            ...base_score[match.matchId],
            ...base_info[match.matchId]
          },
          stats: statsObj[match.matchId],          
          odds: matches_odds[match.matchId]
        }
      })
    }
  })
};

//////////////////////////////////////
// Create today and fixtures matches//
//////////////////////////////////////
const getObjectFixtures = (records) => {
  let [champ, ...fixt] = records;

  // fields of championship name and ico
  let country = champ.ZY;
  let league = champ.ZA;
  let id = champ.ZEE;
  let num = champ.ZB;
  let logo = champ.OAJ;
  let tableId = champ.ZE + '_' + champ.ZC;

  // matches
  let matches = fixt.map((r) => parse_match(r))
  // let matches = fixt.map((r) => parse_match(r)).filter(r=>r.status==="Not started");
  if (matches.length === 0) return 

  return { id, country, num, league, logo, tableId, matches };
};

exports.createFixtures = (data,ignoreId) => {
  //Parse data 
  let parseData = data.split("tournament-page-data-summary-fixtures")[1].split("</div>")[0]
  if (!parseData.includes("AA÷")) return 
  
  //Split data on records
  let records = parseData.replace("~","").split("AA÷")
                    .filter(r=>!ignoreId.some(id => r.includes(id)))
                    .map((r) => ("AA÷"+r).split("¬"))
                    .map((r) => Object.fromEntries(r.map((r) => [r.split("÷")[0], r.split("÷")[1]])));
  //  return getObjectFixtures(records.slice(0,11));
   return getObjectFixtures(records);
};

exports.createTodayMatches = (data) => {
  
  //Split data on records
  let records = data.replace("~","").split("AA÷")
                    .map((r) => ("AA÷"+r).split("¬"))
                    .map((r) => Object.fromEntries(r.map((r) => [r.split("÷")[0], r.split("÷")[1]])));
                   
   return getObjectFixtures(records);
};

/////////////////////
// Create Standings//
/////////////////////

const parse_standing = (record, info, logo)=>{
  // const getKey = (value) =>  [...info].find(([key, val]) => val == value)[0]
// console.log("record",record)

  let next = record.LMT.split("\n")
  let points = record.TP.includes(",")?record.TP.split(",")[0] : record.TP
  let positionTeam = record.TU? info.get(record.TU) : null
  let positionCode = record.TU? record.TU : null

  return {
    rank: record.TR,
    teamName: record.TN,
    teamId: record.TI,
    teamLogo: logo.get(record.TI),
    matchesPlayed: record.TM,
    wins: record.TWR,
    draws: record.TDR,
    losses: record.TLR,
    goals: record.TG,
    points,
    positionTeam,
    positionCode,
    nextMatch: {
      title: next[1],
      matchDate: convertMatchDate(next[2], "next"),
      matchId: record.LME
    }
  }
}

exports.createStandings = (data, idx) => {
  let info = new Map()
  let logo = new Map()
  let record;
  
  data.split("¬~TZ÷")[0].replace(/¬IPU÷/g,"IPU÷").split("¬")
      .map(r=>{
        let id = r.split("IPU÷")[0].replace("IPI÷","")
        let url = r.split("IPU÷")[1]
        logo.set(id,url)
      })

  if (idx===0) {
    record = ("~TV" + data.split("~TV")[1])
              .split("¬")
              .filter(r=>r.includes("TV÷"))
              .map(r=>r.split("TV÷")[1].split("|"))
              .map(r=>info.set(r[0], r[1]))
  }

  // let test = data.split("~TR÷").filter(r=>r.includes("¬TI÷"))
  //   .map(r=>r.split("¬~LMS÷")
  //            .map((r,idx) => {
  //              if (idx===0) r='TR÷'+r
  //              return r.split("¬")
  //             }))

  //             console.log("test",test)

  let parse_data = data.split("~TR÷").filter(r=>r.includes("¬TI÷"))
                       .map(r=>'TR÷' + r.split("¬~LMS÷")
                                      .filter(r=>r.includes("¬TP÷") || r.includes("Next "))).flat()
                       .map(r=> r.split("¬")                        )
                       .map(r=>Object.fromEntries(r.map(r=>[r.split("÷")[0],r.split("÷")[1]])))
                       .map(r=>parse_standing(r,info,logo));
  
  if (idx===0) return {parse_data,info}
  return parse_data
}

exports.createStandingsObject = (data) => {
  const standing = ['overall','home','away']
  const info = data[0].info
  const tables = [data[0].parse_data, data[1], data[2]]
 
  let result = tables.reduce((acc,table,idx)=>{
    acc[standing[idx]] = table
    return acc
  },{})

  result["info"] = (JSON.stringify(Object.fromEntries(info)))

  return result
}


////////////////////////////////////////////////////
// Create Match summary info score, duration and logo//
////////////////////////////////////////////////////
exports.createSummaryObject = (data) => {
  let dataMap = new Map(),
      codeDuration = {"3": "90min", "10": "Extra Time", "11": "Penalties"},
      codeWinner = {"H": "Home Team", "D": "Draw", "A": "Away Team"};
  
  data.split("¬").forEach(record=>dataMap.set(record.split("÷")[0],record.split("÷")[1]))
  
  return {
    duration: codeDuration[dataMap.get('DB')],
    winner: codeWinner[dataMap.get('DJ')],
    scoreFinal: {
      homeTeam: dataMap.get('DE'),
      awayTeam: dataMap.get('DF'),
    },
    score90min: {
      homeTeam: dataMap.get('DG'),
      awayTeam: dataMap.get('DH'),
    }
  }
}


const splitMap = (data, splitText)=>{
  let dataMap = new Map()
  let dataString = splitText + data
  dataString.split("¬").forEach(record=>dataMap.set(record.split("÷")[0],record.split("÷")[1]))
  return dataMap
}

exports.createScoreObject = (data) => {
  if (!data.includes("Half")) return null

  let dataRecord = data.split("AC÷")
  let {1: firstHalfData, 2: secondHalfData} = dataRecord;
  let extraTimeData = dataRecord.filter(f=>f.includes("Extra Time")) 
  let penaltiesData = dataRecord.filter(f=>f.includes("Penalties")) 

  return {
    scoreFirstHalf: firstHalfData? { 
      homeTeam: splitMap(firstHalfData, "AC÷").get('IG'), 
      awayTeam: splitMap(firstHalfData, "AC÷").get('IH') 
    } : null,
    scoreSecondHalf: secondHalfData?  { 
      homeTeam: splitMap(secondHalfData, "AC÷").get('IG'), 
      awayTeam: splitMap(secondHalfData, "AC÷").get('IH') 
    } : null,
    scoreExtraTime:  extraTimeData? { 
      homeTeam: splitMap(extraTimeData, "AC÷").get('IG'), 
      awayTeam: splitMap(extraTimeData, "AC÷").get('IH') 
    } : null,
    scorePenalties:  penaltiesData? { 
      homeTeam: splitMap(penaltiesData, "AC÷").get('IG'), 
      awayTeam: splitMap(penaltiesData, "AC÷").get('IH') 
    } : null  
  }
}


//////////////////////////////////////
// Create latest scores//
//////////////////////////////////////
// Create match object
const parse_score = (score)=>{
  const match = {scoreHT: score.AG? score.AG : "no score", scoreAT: score.AH? score.AH : "no score"}
  const firstHalf= {scoreHT: score.BA? score.BA:"no score", scoreAT: score.BB? score.BB:"no score"}
  const secondHalf= {scoreHT: score.BC? score.BC:"no score", scoreAT: score.BD? score.BD:"no score"}
  return {match, firstHalf, secondHalf}
}

const getObjectLatestScores = (records) => {
  let [champ, ...fixt] = records;
  
  // fields of championship name and ico
  let country = champ.ZY;
  let league = champ.ZA;
  let id = champ.ZEE;
  let num = champ.ZB;
  let logo = champ.OAJ;
  let tableId = champ.ZE + '_' + champ.ZC;

  // matches
  let parseMatches = fixt.map(r => parse_match(r));
  const uniqueMatches = [...new Map(parseMatches.map(item => [item['matchId'], item])).values()]

  return { id, country, num, league, logo, tableId, matches:uniqueMatches };
};

exports.createLatestScores = (data) => {
  //Split data on records
  let records = data.split("tournament-page-data-summary-results")[1]
                    .split("</div>")[0]
                    .replace(/~/g,"")
                    .split("AA÷")
                    .map((r) => ("AA÷"+r).split("¬"))
                    .map((r) => Object.fromEntries(r.map((r) => [r.split("÷")[0], r.split("÷")[1]])));
  return getObjectLatestScores(records);
};
 
//////////////////////////
// Create matches result//
//////////////////////////
exports.sortMatchesResult = (matches) => {
  function orderByDate( a, b ) {
    if ( a.timestamp < b.timestamp ) return 1;
    if ( a.timestamp > b.timestamp ) return -1;
    return 0;
  }

  return matches.sort(orderByDate)
}

exports.splitResultsData = (data) => {
  let champMatches=[];

  data.map((d,idx)=>{
    let records = d.replace(/~/g,"").split("AA÷")
    if (idx!==0) records.shift()
    records.forEach(m=>{
      let obj = ("AA÷"+ m).split("¬").map((r) => [r.split("÷")[0], r.split("÷")[1]]);
      champMatches.push(Object.fromEntries(obj))
    })
  })

  return getObjectLatestScores(champMatches);
}
exports.getMatchSummaryStats = (stats) => {
return {
  cornerKicks: parseInt(stats.cornerKicks.match.homeTeam)
                + parseInt(stats.cornerKicks.match.awayTeam),
  fouls: parseInt(stats.fouls.match.homeTeam)
                + parseInt(stats.fouls.match.awayTeam),
  // throwIns: parseInt(stats.throwIns.match.homeTeam)
  //               + parseInt(stats.throwIns.match.awayTeam), 
  offsides: parseInt(stats.offsides.match.homeTeam)
                + parseInt(stats.offsides.match.awayTeam),
  goals: parseInt(stats.goals.match.homeTeam)
                + parseInt(stats.goals.match.awayTeam),
  yellowCards: parseInt(stats.yellowCards.match.homeTeam)
                + parseInt(stats.yellowCards.match.awayTeam), 
  redCards: parseInt(stats.redCards.match.homeTeam)
                + parseInt(stats.redCards.match.awayTeam),   
  penalties: parseInt(stats.penalties.match.homeTeam)
                + parseInt(stats.penalties.match.awayTeam),  
  goalAttempts: parseInt(stats.goalAttempts.match.homeTeam)
                + parseInt(stats.goalAttempts.match.awayTeam),   
  shotsOnGoal: parseInt(stats.shotsOnGoal.match.homeTeam)
                + parseInt(stats.shotsOnGoal.match.awayTeam),
  bothToScore: (parseInt(stats.goals.match.homeTeam) > 0 
                && parseInt(stats.goals.match.awayTeam) > 0) ? 1 : 0,
  totalOver:   ((parseInt(stats.goals.match.homeTeam)
                + parseInt(stats.goals.match.awayTeam)) > 2.5 ) ? 1 : 0,
  totalUnder:  ((parseInt(stats.goals.match.homeTeam)
                + parseInt(stats.goals.match.awayTeam)) < 2.5 ) ? 1 : 0,                
}
}


///////////////////////////////////////////
// Parsing referee stats for each league //
///////////////////////////////////////////
const convertStats = (match)=>{
    let score = match.summary.scoreFinal.homeTeam + " : " + match.summary.scoreFinal.awayTeam
    let fouls = {
      match: parseInt(match.stats.fouls.match.homeTeam) 
             + parseInt(match.stats.fouls.match.awayTeam),
      homeTeam: parseInt(match.stats.fouls.match.homeTeam),
      awayTeam: parseInt(match.stats.fouls.match.awayTeam)}
    let yellowCards = parseInt(match.stats.yellowCards.match.homeTeam) 
                      + parseInt(match.stats.yellowCards.match.awayTeam)

  return {
    matchId: match.matchId,
    season: match.season,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    score,
    winner: match.summary.winner,
    matchFullDate: match.matchFullDate,
    matchData: match.matchData,
    matchTime: match.matchTime,
    timestamp: match.timestamp,
    round: match.round,
    homeTeamIco: match.homeTeamIco,
    awayTeamIco: match.awayTeamIco,
    homeTeamShortName: match.homeTeamShortName,
    awayTeamShortName: match.awayTeamShortName,
    stats:{
      fouls,
      yellowCards,
      penalties: match.stats.penalties.event,
      redCards: match.stats.redCards.event
    }    
  }
}

const calculateAverageRefStats = (refMatches,key)=>{
  let result;
  let matches = refMatches.filter(match=>!Number.isNaN(match.stats.fouls.match));
  const countMatches = matches.length

  const sumStats = matches.reduce((acc, match)=>{
    // if (key.split("(")[0].trim()==="Miguelgorry J.") {
    //   console.log("dddd", match.stats.fouls.match)
    // }
    let fouls = parseInt(match.stats.fouls.match),
        yellowCards = parseInt(match.stats.yellowCards),
        penalties = (match.stats.penalties==="yes")? 1 : 0,
        redCards = (match.stats.redCards==="yes")? 1 : 0;

    acc['fouls'] = acc['fouls']? acc['fouls'] + fouls: fouls
    acc['yellowCards'] = acc['yellowCards']? acc['yellowCards'] + yellowCards: yellowCards
    acc['penalties'] = acc['penalties']? acc['penalties'] + penalties: penalties
    acc['redCards'] = acc['redCards']? acc['redCards'] + redCards: redCards
    
    return acc
  }, {})

  Object.keys(sumStats).map(key => sumStats[key]=parseFloat((sumStats[key]/countMatches).toFixed(2)))

  return sumStats
}

exports.parseRefereeAllStats = (results) => {
  let refereeStats = new Map();
  let result = [];

  const matches = results.map(res=>{
    return res.matches.map(match=>{
      return {...match, season: res.season}
    })
  }).flat()

  matches.forEach(match=>{
    let referee = match.summary.referee
    let matchStats = convertStats(match)

    if (refereeStats.has(referee)){
      refereeStats.set(referee, [...refereeStats.get(referee),matchStats])
    } else {
      refereeStats.set(referee, [matchStats])
    }
  })

  Object.entries(Object.fromEntries(refereeStats)).forEach(([key, value]) => {
    if (key==="no info") return
    result.push({
      name: key.split("(")[0].trim(),
      country: key.split("(")[1].split(")")[0].trim(),
      countMatches: value.length,
      average: calculateAverageRefStats(value,key),
      matches: value
    })
  });

  return result
}

exports.combineRefereeInfo = (refStats)=>{
  return refStats.map(ref=>{
    let name = ref.name;
    if (typeof refereesInfo[name] === "object") {
      ref["fullName"] = refereesInfo[name].name
      ref["fotoUrl"] = refereesInfo[name].link
      ref["birthDate"] = refereesInfo[name].birthDate
      ref["birthPlace"] = refereesInfo[name].birthPlace
      ref["birthCountry"] = refereesInfo[name].birthCountry
      ref["birthCountryFlag"] = refereesInfo[name].flagUrl
    }
    return ref
  })
}



exports.createRefsSummary = (RefsStats) => {
  function sortRefStats(refStats) {
    function order( a, b ) {
      if ( a.countMatches < b.countMatches ) return 1;
      if ( a.countMatches > b.countMatches ) return -1;
      return 0;
    }
    return refStats.sort(order).filter(s=>s.countMatches > 9)
  }

  return RefsStats.map(champ=>{
    return {
      id: champ.id,
      country: champ.country,
      league: champ.league,
      refsStats: sortRefStats(champ.refsStats.map(ref=>{
        return {
          name: ref.name,
          countMatches: ref.countMatches,
          fouls: ref.average.fouls,
          yellowCards: ref.average.yellowCards,
          penalties: ref.average.penalties,
          redCards: ref.average.redCards,
          nextMatchId: ref.nextMatch? ref.nextMatch.matchId : "no info"
        }
      }))
    }
  })

}



///////////////////////////////////////////
// Calculating teams fouls //
///////////////////////////////////////////
exports.calculateFouls = (fouls)=>{
  let {match, team, opponent} = fouls
  return {
    match: {
      min: Math.min(...match),
      max: Math.max(...match),
      matches: match.length,
      total: match.reduce((a, b) => a + b, 0),
      average: parseFloat((match.reduce((a, b) => a + b, 0) / match.length).toFixed(2)),
      fouls: match,
      last10:{
        min: Math.min(...match.slice(-10)),
        max: Math.max(...match.slice(-10)),            
        total: match.slice(-10).reduce((a, b) => a + b, 0),
        average: parseFloat((match.slice(-10).reduce((a, b) => a + b, 0) / 10).toFixed(2)),
        fouls: match.slice(-10)
      },          
      last5:{
        min: Math.min(...match.slice(-5)),
        max: Math.max(...match.slice(-5)),              
        total: match.slice(-5).reduce((a, b) => a + b, 0),
        average: parseFloat((match.slice(-5).reduce((a, b) => a + b, 0) / 5).toFixed(2)),
        fouls: match.slice(-5)
      },
      last3:{
        min: Math.min(...match.slice(-3)),
        max: Math.max(...match.slice(-3)),             
        total: match.slice(-3).reduce((a, b) => a + b, 0),
        average: parseFloat((match.slice(-3).reduce((a, b) => a + b, 0) / 3).toFixed(2)),
        fouls: match.slice(-3)
      }          
    },
    team: {
      min: Math.min(...team),
      max: Math.max(...team),
      matches: team.length,
      total: team.reduce((a, b) => a + b, 0),
      average: parseFloat((team.reduce((a, b) => a + b, 0) / team.length).toFixed(2)),      
      fouls: team,
      last10:{
        min: Math.min(...team.slice(-10)),
        max: Math.max(...team.slice(-10)),            
        total: team.slice(-10).reduce((a, b) => a + b, 0),
        average: parseFloat((team.slice(-10).reduce((a, b) => a + b, 0) / 10).toFixed(2)),
        fouls: team.slice(-10)
      },          
      last5:{
        min: Math.min(...team.slice(-5)),
        max: Math.max(...team.slice(-5)),              
        total: team.slice(-5).reduce((a, b) => a + b, 0),
        average: parseFloat((team.slice(-5).reduce((a, b) => a + b, 0) / 5).toFixed(2)),
        fouls: team.slice(-5)
      },
      last3:{
        min: Math.min(...team.slice(-3)),
        max: Math.max(...team.slice(-3)),             
        total: team.slice(-3).reduce((a, b) => a + b, 0),
        average: parseFloat((team.slice(-3).reduce((a, b) => a + b, 0) / 3).toFixed(2)),
        fouls: team.slice(-3)
      }               
    },
    opponent: {
      min: Math.min(...opponent),
      max: Math.max(...opponent),
      matches: opponent.length,
      total: opponent.reduce((a, b) => a + b, 0),
      average: parseFloat((opponent.reduce((a, b) => a + b, 0) / opponent.length).toFixed(2)),       
      fouls: opponent,
      last10:{
        min: Math.min(...opponent.slice(-10)),
        max: Math.max(...opponent.slice(-10)),            
        total: opponent.slice(-10).reduce((a, b) => a + b, 0),
        average: parseFloat((opponent.slice(-10).reduce((a, b) => a + b, 0) / 10).toFixed(2)),
        fouls: opponent.slice(-10)
      },          
      last5:{
        min: Math.min(...opponent.slice(-5)),
        max: Math.max(...opponent.slice(-5)),              
        total: opponent.slice(-5).reduce((a, b) => a + b, 0),
        average: parseFloat((opponent.slice(-5).reduce((a, b) => a + b, 0) / 5).toFixed(2)),
        fouls: opponent.slice(-5)
      },
      last3:{
        min: Math.min(...opponent.slice(-3)),
        max: Math.max(...opponent.slice(-3)),             
        total: opponent.slice(-3).reduce((a, b) => a + b, 0),
        average: parseFloat((opponent.slice(-3).reduce((a, b) => a + b, 0) / 3).toFixed(2)),
        fouls: opponent.slice(-3)
      }               
    }               
  }
}

exports.createFoulsObj = (
  foulsMatch, 
  foulsTeam, 
  foulsOpponent,
  ...fouls
) => {
  
  if (!fouls.length) return { match: [foulsMatch], team: [foulsTeam],  opponent: [foulsOpponent] }
  return {
    match: [...fouls[0].match, foulsMatch],
    team: [...fouls[0].team, foulsTeam],
    opponent: [...fouls[0].opponent, foulsOpponent],
  }
}

exports.createFoulsSummary = (FoulsStats) => {
  // function sortRefStats(refStats) {
  //   function order( a, b ) {
  //     if ( a.countMatches < b.countMatches ) return 1;
  //     if ( a.countMatches > b.countMatches ) return -1;
  //     return 0;
  //   }
  //   return refStats.sort(order).filter(s=>s.countMatches > 9)
  // }

  return FoulsStats.map(champ=>{
    return {
      id: champ.id,
      country: champ.country,
      league: champ.league,
      foulsStats: champ.foulsStats.map(foul=>{
        return {
          teamName: foul.teamName,
          allMatches: {
            match: foul.match.average,
            team: foul.team.average,
            opponent: foul.opponent.average,
          },
          last10: {
            match: foul.match.last10.average,
            team: foul.team.last10.average,
            opponent: foul.opponent.last10.average,
          },
          last5: {
            match: foul.match.last5.average,
            team: foul.team.last5.average,
            opponent: foul.opponent.last5.average,
          },
          last3: {
            match: foul.match.last3.average,
            team: foul.team.last3.average,
            opponent: foul.opponent.last3.average,
          },                    
        }
      })
    }
  })

}


//////////////////////////
// Parsing corners detail stats //
//////////////////////////
exports.createCornersObj = (match, ...corners) => {

  let cornersMatch = parseInt(match.stats.corners.match.homeTeam)
                         + parseInt(match.stats.corners.match.awayTeam)
  let cornersHT = parseInt(match.stats.corners.match.homeTeam)
  let cornersAT = parseInt(match.stats.corners.match.awayTeam)

  if (!corners.length) return { match: [cornersMatch], team: [cornersTeam],  opponent: [cornersOpponent] }
  return {
    match: [...corners[0].match, cornersMatch],
    team: [...corners[0].team, cornersTeam],
    opponent: [...corners[0].opponent, cornersOpponent],
  }
}



//////////////////////////
// Parsing Match TimeLine //
//////////////////////////
const objectFromDataRecords = (data) =>{
  return Object.fromEntries(data.split("¬").map((r) => [r.split("÷")[0], r.split("÷")[1]]))
}
const halfScore = (data) =>{
  let score = objectFromDataRecords(data)
  return `${score.IG} - ${score.IH}`
}

const createHalfTimeLine = (record, teams)=>{
  let evRecord = record.split("¬IE÷"),
      evMinute = Object.fromEntries(evRecord[0].split("¬").map((r) => [r.split("÷")[0], r.split("÷")[1]])),
      evInfo = '¬IK÷' + evRecord[1].split("¬IK÷")[1],
      evName = Object.fromEntries(evInfo.split("¬").map((r) => [r.split("÷")[0], r.split("÷")[1]]))
  return {
      minute: evMinute.IB,
      event: evName.IK,
      team: (evMinute.IA === "1")? teams[0] : teams[1]
    }
}

exports.getTimeLine = (data, teams, matchId) => {
  //Split 1st half and 2nd half
  const halfsData = data.split("~AC÷");

  //Halfs score
  const score = { 
    firstHalf: halfScore(halfsData[0].slice(0,40)),
    secondHalf: halfScore(halfsData[1].slice(0,40)),
  }

  //Filter events
  const recordsData = halfsData.map(record => record.split("~III÷").filter(r => r.includes("¬IA÷")))
  const eventsData = recordsData.map(record => record.filter(r => !r.includes("¬IK÷Substitution")))
  const firstHalf = eventsData[0].map(record=> createHalfTimeLine(record, teams))
  const secondHalf = eventsData[1].map(record=> createHalfTimeLine(record, teams))
  return {
    score,
    timeLine: { firstHalf, secondHalf }
  }
};

exports.getTimeLineDetailed = (data, teams, matchId) => {
  
  const timeLine = []
  const deleteRecord = ['','injury','substitution']
  const statsParser = data.split("¬~").filter(r=>r.includes("MD÷"))
  const createTimeObject = statsParser.map(r=>{
    return Object.fromEntries(r.split("¬").map((r) => [r.split("÷")[0], r.split("÷")[1]]))
  })
  
  createTimeObject.reverse()
    .filter(record=> !deleteRecord.some(d => record.MC===d))
    .forEach(record=>{
      if (record.MC==='whistle') {
        timeLine.push({ minute: record.MB, exact: record.MK, event: record.MC})
        return
      }

      let t1=record.MD.indexOf(teams[0])
      let t2=record.MD.indexOf(teams[1])

      if (t1!==-1 && t2!==-1) {
        timeLine.push({
          minute: record.MB,
          exact: record.MK,
          event: record.MC,
          team: (t1<t2)? teams[0] : teams[1]
        })
        return
      }
      if (t1!==-1) timeLine.push({ minute: record.MB, exact: record.MK, event: record.MC,  team: teams[0]})
      if (t2!==-1) timeLine.push({ minute: record.MB, exact: record.MK, event: record.MC,  team: teams[1]})

    })

    function posEndOfFirstHalf() {
      let count=0
      for(let i=0; i< timeLine.length; i++) {
        if (timeLine[i].event==='whistle') count+=1
        if (count > 2) return i
      }
    }
    const pos = posEndOfFirstHalf()

  return { timeLine: {
            firstHalf: timeLine.slice(0,pos),
            secondHalf: timeLine.slice(pos)
          }}
};

exports.verification_time_line = (matchesId, time_line, time_line_detailed) => {
  
  
  
  const startCursor = (id)=>{
    let tl_1stHalf = time_line[id]["timeLine"]["firstHalf"]
    let tl_2ndHalf = time_line[id]["timeLine"]["secondHalf"]
    let tld_1stHalf = time_line_detailed[id]["timeLine"]["firstHalf"]
    let tld_2ndHalf = time_line_detailed[id]["timeLine"]["secondHalf"]
    
    function findPos(arr, minute) {
      for(let i=0; i< arr.length; i++) {
        if (arr[i]["minute"] === minute) return i
      }
    }

    if (tl_1stHalf.length > 0) return findPos(tld_1stHalf, tl_1stHalf[0].minute)
    
  }

  [matchesId[0],matchesId[1]].forEach(id=>{
    let cursor1 = 0
    let cursor2 = startCursor(id)
    
    console.log("cursor1", cursor1);
    console.log("cursor2", cursor2);

    // time_line[id]["timeLine"]["firstHalf"].map(record=>{
    //   verification(record.minute)
    // })

    // time_line[id]["timeLine"]["firstHalf"]

    console.log(time_line[id]["timeLine"]);
  })
  
}


//////////////////////////
// Get standing id for last 5 season //
//////////////////////////
exports.getStandingId = (data, year) => {
  const createObject = (d) => Object.fromEntries(d.split("~AA÷")[0]
                                                  .split("~")[1]
                                                  .split("¬")
                                                  .map(r=>r.split("÷")))

  return data.map((d,idx) => {
    // let seasonYear = `${year-idx}/${year-idx+1}`
    let obj = createObject(d)
    return `${obj.ZE}_${obj.ZC}`
  });
}

exports.getTeamsName = (data) => {
  const records = data.split("¬").filter(r=>r.includes("TN÷"))
  return records.map(r=>r.split("÷")[1])
}

