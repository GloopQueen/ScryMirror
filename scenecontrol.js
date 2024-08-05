var currentPage;

var epochTime;

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
    console.log("the end of the set current page function.");
}

function getCurrentPage(){
    return currentPage;
}

function getCurrentTime(){
    return epochTime;
}



module.exports.setCurrentPage = setCurrentPage;
//module.exports.currentPage = currentPage;
module.exports.currentPage = getCurrentPage;
module.exports.epochTime = getCurrentTime;
//module.exports.epochTime = epochTime;