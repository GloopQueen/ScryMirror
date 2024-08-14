const res = require("express/lib/response");

var currentPage;
var epochTime;

var AudienceHPTotal;
var AudienceMPTotal;
//totals not implemented yet
var AudienceMPThisRound;
var AudienceHPThisRound;

const delaySeconds = 20;

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
    return 0; //do I have to do this? I feel like I read somewhere I'm supposed to do this.
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


module.exports.setCurrentPage = setCurrentPage;
//module.exports.currentPage = currentPage;
module.exports.currentPage = getCurrentPage;
module.exports.epochTime = getCurrentTime;
//module.exports.epochTime = epochTime;
module.exports.resetRoundVars = resetRoundVars;
module.exports.updateRoundVars = updateRoundVars;
module.exports.getRoundVars = getRoundVars;

