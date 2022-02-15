const got = require('got')
const fetchData = require("../constants/fetch-data");
const champs = require("../constants/champ-list");
const teamsAbbr = require("../constants/teams-abbr");
const utils = require("./utils");

const delayIncrement = 10;

function getTodayMatches() {
  return new Promise((resolve, reject) => {
    // Array url for parsing
    let urls = champs.map(champ => `${fetchData.url}t_1_${champ.num}_${champ.id}_2_en_1`);
    // Array requests
    let requests = urls.map((url) => got(`${url}`, fetchData.params));

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let todayMatches =[]
        data.forEach(d => {
          if (!d) return;
          let matches = utils.createTodayMatches(d);
          matches? todayMatches.push(matches) : null;
        })

        // data.forEach(d => d? todayMatches.push(utils.createTodayMatches(d)) : null);
        resolve(todayMatches);
      })
      .catch(function(err) {
        console.log(err.message); 
      });    
  })
}

function getFixturesAndScores(ignoreId) {
  return new Promise((resolve, reject) => {
    // Array url for parsing
    let urls = champs.map(champ => {
      let country = champ.country.toLowerCase()
      let league = champ.league.replace(".", "").replace(/ /g, "-").toLowerCase()
      return `${fetchData.baseUrl}football/${country}/${league}`
    });
    // Array requests
    let requests = urls.map((url) => got(`${url}`, fetchData.params)); 

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let fixtures = [], 
            latest_scores = [];
        data.forEach(d => {
          let parseFixtures = utils.createFixtures(d,ignoreId)
          parseFixtures? fixtures.push(parseFixtures):null
          latest_scores.push(utils.createLatestScores(d))
        });

        resolve({fixtures, latest_scores});
      });    
  })
}

function getMatchesLogo(matchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = matchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}dc_1_${id}`, fetchData.params))
    })

    // let requests = matchesId.map(id => got(`${fetchData.url}dc_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          result[matchesId[idx]] = d.split("¬DEI÷")[1].split("png")[0]+'png';
        });
        resolve(result);
      });    
  })
}

function getMatchesInfo(matchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = matchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_sui_1_${id}`, fetchData.params))
    })

    // let requests = matchesId.map(id => got(`${fetchData.url}df_sui_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          let referee = d.includes("REF")? d.split("REF¬MIV÷")[1].split("¬")[0] 
                        + " (" + d.split("RCC¬MIV÷")[1].split("¬")[0] +")" : "no info";
          let venue = d.includes("VEN")? d.split("VEN¬MIV÷")[1].split("¬")[0] : "no info";
          result[matchesId[idx]]={referee,venue} 
        });
        resolve(result);
      });    
  })
}

function getMatchesOdds(matchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = matchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_dos_1_${id}_`, fetchData.params))
    })

    // let requests = matchesId.map(id => got(`${fetchData.url}df_dos_1_${id}_`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          result[matchesId[idx]] = (d === "")? "no data" : utils.createMatchOddsObject(d); 
        });
        resolve(result);
      });    
  })
}

function getHeadToHead(leagueMatchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = leagueMatchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_hh_1_${id}`, fetchData.params))
    })

    // let requests = leagueMatchesId.map(id => got(`${fetchData.url}df_hh_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = [];
        data.forEach((d,idx) => {
          result.push({[leagueMatchesId[idx]]:utils.getLastMatches(d,leagueMatchesId[idx])}) 
        });
        resolve(result);
      });    
  })
}

function getMatchSummary(lastMatchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = lastMatchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}dc_1_${id}`, fetchData.params))
    })

    // let requests = lastMatchesId.map(id => got(`${fetchData.url}dc_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          result[lastMatchesId[idx]]=utils.createSummaryObject(d)
        });
        resolve(result);
      });    
  })
}

function getBaseStatsAndScoreInfo(lastMatchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = lastMatchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_sui_1_${id}`, fetchData.params))
    })

    // let requests = lastMatchesId.map(id => got(`${fetchData.url}df_sui_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let base_stats = {}, base_score = {}, base_info = {};
        data.forEach((d,idx) => {
          const matchId = lastMatchesId[idx]
          let referee = d.includes("REF¬MIV÷")? d.split("REF¬MIV÷")[1].split("¬")[0] 
                        + " (" + d.split("RCC¬MIV÷")[1].split("¬")[0] +")" : "no info";

          let venue = d.includes("VEN¬MIV÷")? d.split("VEN¬MIV÷")[1].split("¬")[0] : "no info";

          base_stats[matchId] = (d === "")? "no data" : utils.getMachesBaseStats(d, matchId); 
          base_info[matchId]={ referee, venue } 
          base_score[matchId]=utils.createScoreObject(d) 
        });
        resolve( { base_stats, base_score, base_info });
      });    
  })
}


function getDetailedStats(lastMatchesId) {
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = lastMatchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_st_1_${id}`, fetchData.params))
    })

    // let requests = lastMatchesId.map(id => got(`${fetchData.url}df_st_1_${id}`, fetchData.params))

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          result[lastMatchesId[idx]] = (d === "")? "no data" : utils.getExpMachesStats(d); 
        });
        resolve(result);
      });    
  })
}

function getMatchesResult(champ) {
  return new Promise((resolve, reject) => {
    let {num, id , season} = champ
    // Array url for parsing
    let urls = [0,1,2,3].map(page => `${fetchData.url}tr_1_${num}_${id}_${season}_${page}_2_en_1`);
    
    // Array requests
    let requests = urls.map((url) => got(`${url}`, fetchData.params));

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => utils.splitResultsData(data))
      .then(data => {
        // let todayMatches =[]
        // data.forEach(d => d? todayMatches.push(utils.createTodayMatches(d)) : null);
        resolve(data);
      });    
  })
}

function getStandings(champ) {
  return new Promise((resolve, reject) =>{
    // Array requests
    let requests = [1,2,3].map(num => {
       return got(`${fetchData.url}to_${champ.standingsId}_${num}`, fetchData.params)
    })

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => data.map((d,idx)=>utils.createStandings(d,idx)))
      .then(data => utils.createStandingsObject(data))
      .then(obj=>resolve(obj))
  })
}

function getResultData(champ, season) {

  return new Promise((resolve, reject) => {
    let {num, id} = champ

    // Array url for parsing
    let urls = [0,1,2,3].map(page => `${fetchData.url}tr_1_${num}_${id}_${season}_${page}_2_en_1`);
    
    // Array requests
    let requests = urls.map((url) => got(`${url}`, fetchData.params));

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => utils.splitResultsData(data))
      .then(data => {
        // let todayMatches =[]
        // data.forEach(d => d? todayMatches.push(utils.createTodayMatches(d)) : null);
        resolve(data);
      });    
  })
}

function getMatchesTimeLineDetailed(matchesId, matchesTeams) {
  
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = matchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_lc_1_${id}`, fetchData.params))
    })
    
    Promise.all([requests[0], requests[1]])
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          let matchId = matchesId[idx]
          result[matchId] = (d === "")? "no data" 
                                             : utils.getTimeLineDetailed(d, matchesTeams.get(matchId),matchId); 
        });
        resolve(result);
      });    
  })
}


function getMatchesTimeLine(matchesId, matchesTeams) {
  
  return new Promise((resolve, reject) => {
    let delay = 0; 
    // Array requests with delay
    let requests = matchesId.map(async id => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        got(`${fetchData.url}df_sui_1_${id}`, fetchData.params))
    })

    Promise.all([requests[0], requests[1]])
      .then(responses => responses.map(res => res.body))
      .then(data => {
        let result = {};
        data.forEach((d,idx) => {
          let matchId = matchesId[idx]
          result[matchId] = (d === "")? "no data" 
                                             : utils.getTimeLine(d, matchesTeams.get(matchId),matchId); 
        });
        resolve(result);
      });    
  })
}

function getLeagueTeams (champ) {
  return new Promise((resolve,reject)=>{
    let {num, id , season, year} = champ
    // Array url for parsing
    let urls = [...Array(6).keys()].map(n => `${fetchData.url}tr_1_${num}_${id}_${season-n}_1_2_en_1`);
    // Array requests
    let requests = urls.map((url) => got(`${url}`, fetchData.params));

    Promise.all(requests)
      .then(responses => responses.map(res => res.body))
      .then(data => {
        const standingId = utils.getStandingId(data,year)
        let request = standingId.map(id => got(`${fetchData.url}to_${id}_1`, fetchData.params));
        
        Promise.all(request)
        .then(responses => responses.map(res => res.body))
        .then(data => {
          let result=[]
          data.forEach((d,idx) => {
            let seasonYear = `${year-idx}/${year-idx+1}`
            result.push({
              season: seasonYear,
              teams: utils.getTeamsName(d),
              id: standingId[idx]
            })
          })
         resolve(result);
        })
      });   
  })
}

module.exports = {
  league_team: async (champ) => await getLeagueTeams(champ),
  today_matches: async () => await getTodayMatches(),
  matches_result: async (champ) => await getMatchesResult(champ),
  fixtures_scores: async (ignoreId) => await getFixturesAndScores(ignoreId),
  matches_logo: async (matchesId) => await getMatchesLogo(matchesId),
  matches_info: async (matchesId) => await getMatchesInfo(matchesId),
  matches_odds: async (matchesId) => await getMatchesOdds(matchesId),
  head_to_head: async (leagueMatchesId) => await getHeadToHead(leagueMatchesId),
  match_summary: async (lastMatchesId) => await getMatchSummary(lastMatchesId),
  base_stats_score_info: async (lastMatchesId) => await getBaseStatsAndScoreInfo(lastMatchesId),
  detailed_stats: async (lastMatchesId) => await getDetailedStats(lastMatchesId),
  matches_time_line_detailed: async (matchesId, matchesTeams) => await getMatchesTimeLineDetailed(matchesId, matchesTeams),
  matches_time_line: async (matchesId, matchesTeams) => await getMatchesTimeLine(matchesId, matchesTeams),
  
  standings: async (champs) => {
    let stands=[];
    let filterChamps = champs.filter(champ=>champ.standings==="on")
    for (let i=0; i < filterChamps.length; i++) {
      stands.push({
        country: filterChamps[i].country,
        league: filterChamps[i].league,
        id: filterChamps[i].id,
        standings: await getStandings(filterChamps[i])
      })
    }
    return stands;
  },  
  result_data: async (champ, season) => await getResultData(champ, season),
  
}