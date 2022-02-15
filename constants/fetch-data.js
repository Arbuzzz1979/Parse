
module.exports = Object.freeze({
  url: "https://d.flashscore.com/x/feed/",
  baseUrl: "https://www.flashscore.com/",
  // agent: keepaliveAgent,
  options: {
    method: "get",
    headers: {
      authority: "d.flashscore.com",
      Connection: "keep-alive",
      "Keep-Alive": "timeout=5, max=100",
      "Content-Type": "text/plain",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      "x-fsign": "SW9D1eZo",
    },
  },
  params: {
    headers: {
      authority: "d.flashscore.com",
      Connection: "keep-alive",
      "Content-Type": "text/plain",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      "x-fsign": "SW9D1eZo",
    },
    // agent: keepaliveAgent,
  },  
});



// function getTodayMatches 
// `${fetchData.url}t_1_${champ.num}_${champ.id}_2_en_1`

// function getFixturesAndScores
// `fetchData.baseUrl}football/${country}/${league}`

// function getMatchesLogo
// `${fetchData.url}dc_1_${id}`
    
// function getMatchesInfo
// `${fetchData.url}df_sui_1_${id}`
      
// function getMatchesOdds
// `${fetchData.url}df_dos_1_${id}_`

        
// function getHeadToHead
// `${fetchData.url}df_hh_1_${id}`
          
// function getMatchSummary(lastMatchesId) {
// `${fetchData.url}dc_1_${id}`
            
// function getBaseStatsAndScoreInfo
// `${fetchData.url}df_sui_1_${id}`
              
// function getDetailedStats
// `${fetchData.url}df_st_1_${id}`
                
                
// function getMatchesResult
// `${fetchData.url}tr_1_${num}_${id}_${season}_${page}_2_en_1`                               

// function getStandings
// `${fetchData.url}to_${champ.standingsId}_${num}`       
                    
// function getResultData
// `${fetchData.url}tr_1_${num}_${id}_${season}_${page}_2_en_1`
                      
// function getMatchesTimeLineDetailed
// `${fetchData.url}df_lc_1_${id}`
                        
// function getLeagueTeams
// `${fetchData.url}tr_1_${num}_${id}_${season-n}_1_2_en_1`
// `${fetchData.url}to_${id}_1`            
