const res = require("express/lib/response");


/*
 * Page info atm (should get converted to names in the future)
 * -1 - Client will ignore / default server launch state
 * 0 - voting UI
 * 1 - demonstration minigame (2 simple projectiles)
 * 2 - flurry of projectiles
 * 3 - blackjack minigame
 * 
 */


/**
 * @todo Below should be tracked in DB. I'm gonna implement tracking HP/MP totals on the streamer's end temporarily 
 */
var currentPage;
var epochTime;
var AudienceHPTotal;
var AudienceMPTotal;

var AudienceMPThisRound;
var AudienceHPThisRound;

const delaySeconds = 20;

//Poll variables
/**
 * @todo Vote tallies should definitely get moved to the database once that actually exists.
 */
const voteForm = {names:["Name1","Name2","Name3","Name4"],mps:[0,0,0,0]};
const talliesArray = [0,0,0,0];




//the "page" and related variables are to tell the client what attack we're on and when to run it
function setCurrentPage(number){
    currentPage = number;
    console.log(currentPage);
//    epochTime = parseInt( (Date.now()/1000) + delaySeconds );
    var d = new Date();
    var seconds = Math.floor(d.getTime() / 1000);
    epochTime = seconds;
       //epochTime = 420;
    console.log(epochTime);
    console.log(`Current Phase set to ${currentPage}.`);
}

function getCurrentPage(){
    return currentPage;
}

function getCurrentTime(){
    return epochTime;
}

function resetRoundVars(){
    AudienceHPThisRound = 0;
    AudienceMPThisRound = 0;

}

function updateRoundVars(hp, mp){
    AudienceHPThisRound = AudienceHPThisRound + hp;
    AudienceMPThisRound = AudienceMPThisRound + mp;
}

function getRoundVars(type){
    var result
    if (type == "hp"){
        result = AudienceHPThisRound;
    }
    if (type == "mp"){
        result = AudienceMPThisRound;
    }
    return result;
}



//voting related functions
function setVoteOption(num,name,mpvalue){
    voteForm.names[num] = name;
    voteForm.mps[num] = mpvalue;
    clearTallies();
}

function getVoteForm(){
    return voteForm;
}

function enterBallot(num){
    talliesArray[num] = talliesArray[num] + 1;
}

function getVoteTallies(){
    return talliesArray;
}

function clearTallies(){
    talliesArray.fill(0);
}

module.exports.setCurrentPage = setCurrentPage;
//module.exports.currentPage = currentPage;
module.exports.currentPage = getCurrentPage;
module.exports.epochTime = getCurrentTime;
//module.exports.epochTime = epochTime;
module.exports.resetRoundVars = resetRoundVars;
module.exports.updateRoundVars = updateRoundVars;
module.exports.getRoundVars = getRoundVars;
module.exports.setVoteOption =  setVoteOption;
module.exports.getVoteForm = getVoteForm;
module.exports.enterBallot = enterBallot;
module.exports.getVoteTallies = getVoteTallies;