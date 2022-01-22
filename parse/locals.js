const got = require('got')
const fetchData = require("../constants/fetch-data");
const champs = require("../constants/champ-list");
const refereesInfo = require("../constants/referees-info");
const colors = require("colors");
const fs = require("fs");
const path = require("path");

const dirData = path.join(__dirname, '../data');
const dirResultsArchive = path.join(__dirname, '../data/results/archive');
const dirCurrentResults = path.join(__dirname, '../data/results/current');
const dirStatsReferee = path.join(__dirname, '../data/stats/referee');
const dirConstants = path.join(__dirname, '../data/constants');

// Load services
const parse = require("./services");
const utils = require("./utils");


const resultsMatches = async (season_results) => {
  let statsObj = {};
  // All match id from latest matches list
  const latestMatchesId = utils.getOneLeagueMatchesId(season_results)

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

    return {
      ...season_results,
      matches: season_results.matches.map(match=>{
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

}

const createAbbreviations = async (champ) => {
  let teamAbbr = new Map()
  
  function createTeamsMap (data) {
    let dataRecords = data.split("~AA÷").map(r=>r.split("¬"))
    
    let dataObject = dataRecords.map((r) => Object.fromEntries(r.map((r) => [r.split("÷")[0], r.split("÷")[1]])))
    
    dataObject.forEach(obj => {
      teamAbbr.set(obj.AE, obj.WM)
      teamAbbr.set(obj.AF, obj.WN)
      // teamNames.set(obj.JA, {name:obj.AE, abbr:obj.WM})
      // teamNames.set(obj.JB, {name:obj.AF, abbr:obj.WN})
    })
  }
  
  let requests = champs.map(champ=> {
    let {num, id ,season} = champ
    return got(`${fetchData.url}tr_1_${num}_${id}_${season}_1_2_en_1`, fetchData.params)
  })

  for (let idx = 0; idx < requests.length; idx++) {
    let res = await requests[idx];
    let data = await res.text();
    createTeamsMap(data)
  }
  console.log(teamAbbr)
  fs.writeFile(path.join(dirData, `abbreviations.json`), JSON.stringify(Object.fromEntries(teamAbbr)),
  function (error) {
    if (error) reject(error);
    console.log("write abbreviations.json done".blue)
  }
);     

}

const createTeamsAbbr = async (champ) => {
  let teams = new Map();
  for(const champ of champs) {
    let res = JSON.parse(fs.readFileSync(path.join(dirCurrentResults, `${champ.id}.json`), "utf8"))
    
    res.forEach(champ=>champ.matches.forEach(match=>{
      teams.set(match.homeTeam, match.homeTeamShortName)
      teams.set(match.awayTeam, match.awayTeamShortName)
    }))
  }

  fs.writeFile(path.join(dirConstants, `teamsAbbr.json`), 
    JSON.stringify(Object.fromEntries(teams)), (err) => {
      if (err) reject(err);
      console.log(`teamsAbbr.json created`.green)
  });  
  
}

//Create results for current season
exports.createCurrentResults = async () => {
  for(const champ of champs) {
    if (!champ.top) continue 
    
    let results = [];

    console.time("result_data time"); 
    let season_results = await parse.result_data(champ, champ.season)
    console.timeEnd("result_data time");

    console.time("resultsMatches time"); 
    let season_results_info = await resultsMatches(season_results)
    console.timeEnd("resultsMatches time");

      results.push({
        num: `${champ.season}`,
        season: `${champ.year}/${champ.year + 1}`,
        id: champ.id,
        matches: utils.sortMatchesResult(season_results_info.matches)
      })
      console.log(`season ${champ.year}/${champ.year + 1} for ${champ.league} done`.yellow)

    console.log(`Object done for ${champ.league}`.blue)
      
    fs.writeFileSync(path.join(dirCurrentResults, `${champ.id}.json`), JSON.stringify(results), (err) => {
        if (err) reject(err);
        console.log(`${champ.id}.json created`.green)
    });   
  }
}

//Create results for last 5 seasons
const createResultsArchive = async () =>{
  for(const champ of champs) {
    if (!champ.top) continue 
    
    let results = [];

    for (let i=1; i < 6; i++) {
      let season_results = await parse.result_data(champ, champ.season-i)
      let season_results_info = await resultsMatches(season_results)

      results.push({
        num: `${champ.season-i}`,
        season: `${champ.year-i}/${champ.year+1-i}`,
        id: champ.id,
        matches: utils.sortMatchesResult(season_results_info.matches)
      })
      console.log(`season ${champ.year-i}/${champ.year+1-i} for ${champ.league} done`.yellow)
    }

    console.log(`Object done for ${champ.league}`.blue)
      
    fs.writeFileSync(path.join(dirResultsArchive, `${champ.id}.json`), JSON.stringify(results), (err) => {
        if (err) reject(err);
        console.log(`${champ.id}.json created`.green)
    });   
  }
}

//Create referees statistics for top champ
exports.createStatsReferee = async () => {
  let result=[];
  for(const champ of champs) {
    if (!champ.top) continue 

    const resultsArchive = fs.readFileSync(path.join(dirResultsArchive, `${champ.id}.json`),"utf8");
    const currentResults = fs.readFileSync(path.join(dirCurrentResults, `${champ.id}.json`),"utf8");
    const allResults = [...JSON.parse(currentResults),...JSON.parse(resultsArchive)]

    const refereeStats = utils.parseRefereeAllStats(allResults)

    result = utils.combineRefereeInfo(refereeStats)

    console.log(`Object refereeStats done for ${champ.league}`.green)

    fs.writeFileSync(path.join(dirStatsReferee, `${champ.id}.json`), JSON.stringify(result), (err)=>{
      if (err) reject(err);
      console.log(`${champ.id}.json for ${champ.league} created`.blue)
    });    
  }
}

//Create referees statistics for top champ
const parseRefsFoto = async () => {
  const counryAbbr = {Italy: "rita", France: "rfra", Spain: "r", Germany: "rger", England: "reng" }

  let result={};

  for(const champ of champs) {
    if (!champ.top) continue 

    const formatKey = (data) => {
      let name = data.split('.html">')[1].normalize("NFD").replace(/\p{Diacritic}/gu, "")
      return `${name.split(" ").pop()} ${name.slice(0,1)}.`
    }

    const formatValue = (data) => {
      return {
        name: data.split('.html">')[1].normalize("NFD").replace(/\p{Diacritic}/gu, ""),
        link: `https://www.bdfutbol.com/i/a/${data.split('.html">')[0].split('"r')[1]}.jpg`
      }
    }

    const refStats = JSON.parse(fs.readFileSync(path.join(dirStatsReferee, `${champ.id}.json`),"utf8"));
    // const refInfo = fs.readFileSync(path.join(dirConstants, `refInfo.json`),"utf8");
    // console.log(refInfo["Dean M."])
    const refsName = refStats.map(ref=>ref.name)

    const bdfutbol = await got(`https://www.bdfutbol.com/en/r/${counryAbbr[champ.country]}.html`)
    const data = await bdfutbol.body

    const data_tr = data.split("<table")[1].split("/table")[0],
          data_td = data_tr.split("<tr").filter(td=>td.includes("<a href")),
          data_link = data_td.map(td=>td.split("<a href=")[1].split("</a")[0]),
          data_obj = Object.fromEntries(data_link.map(d => [formatKey(d), formatValue(d)]))
   
    refsName.forEach(name=>{
      // result[name] = data_obj[name]? data_obj[name]: refInfo[name]? refInfo[name]: "no data"
      result[name] = refereesInfo[name]? refereesInfo[name] : data_obj[name]? data_obj[name] : "no data"
    })
  }

    fs.writeFile(path.join(dirConstants, `referees.json`), JSON.stringify(result), (err)=>{
      if (err) reject(err);
      console.log(`referees.json created`.blue)
    });  

}

const parseRefsInfo = async () => {
  let flag = {
    England : "/res/_fs/build/en.12159c6.png",
    France: "/res/_fs/build/fr.f5e7288.png",
    Spain: "/res/_fs/build/es.ac54d02.png",
    Italy: "/res/_fs/build/it.225fa57.png",
    Germany: "/res/_fs/build/de.494bda8.png",
    Australia: "/res/_fs/build/au.6b76ac9.png",
    Belgium: "/res/_fs/build/be.35385b1.png",
    Switzerland: "/res/_fs/build/ch.fc3c710.png",
    Ireland: "/res/_fs/build/ie.94179e5.png",
    Wales: "/res/_fs/build/wa.41aac5a.png",
    Portugal: "/res/_fs/build/pt.0e255ff.png",
  }
  let refereePage = {}, result = {}, refObj = {}

  const referees = JSON.parse(fs.readFileSync(path.join(dirConstants, `referees.json`),"utf8"));

  for (const [key, value] of Object.entries(referees)) {
    console.log("key",key)
    console.log("value",value)
    if (value==="no data") continue
    let id = value.link.split("/i/a/")[1].split(".jpg")[0]
    refereePage[key]=id
  }

  for (const [key, value] of Object.entries(refereePage)) {
    const bdfutbol = await got(`https://www.bdfutbol.com/en/r/r${refereePage[key]}.html`)
    const data = await bdfutbol.body
    let formatData = data.split("Complete name:")[1].split("</a></div>")[0].split('text-blanc">')
    let country = formatData[4].split("/.html'>")[1]
    let birth = formatData[2].split('</div>')[0]

    refObj[key] = {
        // page: `https://www.bdfutbol.com/en/r/r${refereePage[key]}.html`,
        birthDate: (birth.length>12)?birth.split(",")[0]:birth,
        birthPlace: formatData[3].split('</div>')[0],
        birthCountry: formatData[4].split("/.html'>")[1],
        flagUrl: flag[country]
      }
  }

  Object.keys(refObj).forEach(key=>{
    result[key] = {...referees[key], ...refObj[key]}
  })

  fs.writeFile(path.join(dirConstants, `refInfo.json`), JSON.stringify(result), (err)=>{
    if (err) reject(err);
    console.log(`refInfo.json created`.blue)
  });  
  
}  

//Run once
if (process.argv[2] === '-abbr') {createTeamsAbbr()}
if (process.argv[2] === '-cra') {createResultsArchive()}
if (process.argv[2] === '-prf') {parseRefsFoto()}
if (process.argv[2] === '-pri') {parseRefsInfo()}


//Run everyday
if (process.argv[2] === '-ccr') {createCurrentResults()}
if (process.argv[2] === '-csr') {createStatsReferee()}




