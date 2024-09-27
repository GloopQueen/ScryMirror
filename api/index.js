// Load in env variables
require('./common/utils/environment/loadEnv.js');
// Express and Middleware
const express = require('express');
var cors = require('cors');
// Routers
const responders = require('./routers/responders.js');
// Database Value getters/setters
const dbCurrentPhaseId = require('./common/utils/dbValues/currentPhaseId.js');
// Utility Files
const scenecontrol = require('./scenecontrol.js');
// Express behavior patching
// Set up express async error handling
require('express-async-errors');

// Create App
const app = express();

// Adding some clumsy security to prevent potential harassment
// Base case should be handled by dotenv but leaving it because it's funny
const THE_WEED_NUMBER = 69;
const adminkey = process.env.ADMINKEY || THE_WEED_NUMBER;

// Express middleware setup
app.use(cors());
app.use(express.json());

// Express local constants initialization
app.locals.currentPhaseId = 0;
app.locals.respondersCount = {};

scenecontrol.setCurrentPage(-1);

const delaySeconds = 7;


app.get('/', (req, res) =>{
    res.send("hello world!");
});


/// TODO: this is probably garbage
app.get('/api/courses', (req, res) =>{
    res.send([1,2,3]);
});

/// TODO: this too can probably go
app.get('/api/courses/:id', (req, res) => {
    res.send(req.params.id); 
    //res.send(req.query); - gets queries
})


//gets current "page", aka what phase we're on, probably removeable at this point
app.get('/api/currentpage', (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage);
    console.log(pageInt);
    res.send("Page Is:"+ pageInt); 
})

//old non-json status getter. probably trash too
app.get('/api/currentstatus', (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage());
    var timeInt = parseInt(scenecontrol.epochTime());
    
    var d = new Date();
    let s = secondsSolver(d.getSeconds());

    var currentstatus = pageInt + "|" + timeInt + "|" + s;
    console.log(currentstatus);
    res.send(currentstatus); 
})


//gets game status. the "phase ID" increments every time the streamer/boss does a new move or starts a new vote
//clients can use this information to track what phase pattern and the server uses it to ignore late info.
app.get('/api/statusjson', async (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage());
    var timeInt = parseInt(scenecontrol.epochTime());
    var theHP = parseInt(scenecontrol.getRoundVars("hp"));
    var theMP = parseInt(scenecontrol.getRoundVars("mp"));
    var AudienceTotalHP = parseInt(scenecontrol.getRoundVars("hptotal"));
    var AudienceTotalMP = parseInt(scenecontrol.getRoundVars("mptotal"));
    var AudienceMaxHP = parseInt(scenecontrol.getRoundVars("hpmax"));
    var AudienceMaxMP = parseInt(scenecontrol.getRoundVars("mpmax"));
    var HPboss = parseInt(scenecontrol.getRoundVars("bosshp"));
    var HPbossMax = parseInt(scenecontrol.getRoundVars("bossmax"));
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    


    var d = new Date();
    let s = secondsSolver(d.getSeconds());


    res.json({
        thePage: pageInt ,
        currentEpochStamp: timeInt ,
        currentSeconds: s,
        currentPhaseId,
        roundHP: theHP,
        roundMP: theMP,
        totalHP: AudienceTotalHP,
        totalMP: AudienceTotalMP,
        maxHP: AudienceMaxHP,
        maxMP: AudienceMaxMP,
        bossHP: HPboss,
        bossMaxHP: HPbossMax,
    }
    )
})

//edit game vars directly
app.get('/api/changevar/:adminkey/:varname/:num', (req, res) => {
    if (adminkey != parseInt(req.params.adminkey) ){
        res.send("Invalid admin key");
        console.log("Invalid admin key detected.");
        return;
    }
    var value = parseInt(req.params.num);
    var varname = String(req.params.varname);
    scenecontrol.setGameVarsDirectly(varname,value);
    res.send(`Setting ${varname} to ${value}`);
})

app.get('/api/damageboss/:adminkey/:num', (req, res) => {
    if (adminkey != parseInt(req.params.adminkey) ){
        res.send("Invalid admin key");
        console.log("Invalid admin key detected.");
        return;
    }
    var value = parseInt(req.params.num);
    scenecontrol.damageBoss(value);
    res.send(`Smacked boss for ${value}`);
})

app.get('/api/applyvars/', (req, res) => {
    scenecontrol.applyRoundVarsToTotals;
    scenecontrol.resetRoundVars;
    res.send(`Round vars applied and cleared.`);
})


/**
 * @todo This should be a PATCH as it's updating an existing resource 
 */
//Sets page. admin key required as a clumsy security measure.
app.get('/api/pageset/:adminkey/:num', async (req, res) => {
    // TODO: confirming admin key should be a function or something
    if (adminkey != parseInt(req.params.adminkey) ){
        res.send("Invalid admin key");
        console.log("Invalid admin key detected.");
        return;
    }
    await dbCurrentPhaseId.incrementCurrentPhaseId(app);
    var pageInt = parseInt(req.params.num);
    //console.log(scenecontrol.currentPage());
    scenecontrol.resetRoundVars();
    scenecontrol.setCurrentPage(pageInt);
    console.log("Page set:"+ scenecontrol.currentPage());
    res.send("Page Set:"+ scenecontrol.currentPage()); 
})


/**
 * @todo The client should really be sending JSON here instead
 */
//Client submits info after doing an phase/minigame. Includes how much damage they took and how manypoints they got.
app.get('/api/clientresults/:phaseId/:hp/:mp', async (req, res) => {
    var phaseId = parseInt(req.params.phaseId);
    var theHP =  parseInt(req.params.hp);
    var theMP =  parseInt(req.params.mp);
    var responseCode = 0;
    var responseText;
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    if ( phaseId == currentPhaseId ){
        scenecontrol.updateRoundVars(theHP,theMP);
        responseText = `Response for action ${phaseId} recieved.`;
    } else {
        console.log(`Recieved but discarding results. Server phaseId is ${currentPhaseId}, Client said Phase ID ${phaseId} HP ${theHP} MP ${theMP}` );
        responseCode = 1;
        responseText = `Response Discarded. Desync issue? Server phaseId ${currentPhaseId}, You said ${phaseId}`;
    }

    res.json({
        response: responseCode ,
        responseM: responseText ,
    }
    ) 

});


//voting related paths

//gets current vote choices
app.get('/api/getvoteoptions', (req, res) => {
    var feedback = scenecontrol.getVoteForm();
 
    res.json({
        name1: feedback.names[0] ,
        name2: feedback.names[1] ,
        name3: feedback.names[2] ,
        name4: feedback.names[3] ,
        mp1: feedback.mps[0] ,
        mp2: feedback.mps[1] ,
        mp3: feedback.mps[2] ,
        mp4: feedback.mps[3] , 
    }
    ) 

});


/**
 * @todo After there's a db, getvotetally and inputvote should be plugged into it.
 * 
 */

//gets current vote tallies.
app.get('/api/getvotetally', (req, res) => {
    var talliesArray = scenecontrol.getVoteTallies();
    var feedback = scenecontrol.getVoteForm();
    console.log(talliesArray)
    //var phony1 = Math.floor(Math.random() * 101);
    //var phony2 = Math.floor(Math.random() * 101);
    //var phony3 = Math.floor(Math.random() * 101);
    //var phony4 = Math.floor(Math.random() * 101);
    res.json({
        name1: feedback.names[0] ,
        name2: feedback.names[1] ,
        name3: feedback.names[2] ,
        name4: feedback.names[3] ,
        vote1: talliesArray[0],
        vote2: talliesArray[1],
        vote3: talliesArray[2],
        vote4: talliesArray[3],
    })
});


//for clients submitting their vote choice aka "ballot" via json
app.post("/api/votechoice/", async (req, res) => {
    var responseCode;
    var responseMessage;
    var ballotChoice;
    var phaseID = parseInt(req.body.phaseid);
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    if (phaseID != currentPhaseId ) {
        responseCode = 1;
        responseMessage = "Invalid Phase ID. Possible Desync issue?";
        console.log("Vote recieved but discarded due to Invalid Phase ID. Recieved " + phaseID+ " local is "+ currentPhaseId);
        console.log(req.body.phaseid)
    } else {
        ballotChoice = parseInt(req.body.voteResponse);
        scenecontrol.enterBallot(ballotChoice);
        responseCode = 0;
        responseMessage = req.body.voteResponse;
        console.log(`Vote for ${req.body.voteResponse} acccepted.`);
    }
    res.json({
        response: responseCode ,
        responseM: responseMessage ,
    })

})


//for game host to set vote options.
app.post("/api/:adminkey/setvotevalues", (req, res) => {
        // TODO: confirming admin key should be a function or something
    if (adminkey != parseInt(req.params.adminkey) ){
        console.log("Invalid admin key detected.");
        res.json({
            response: 1 ,
            responseM: "Invalid Admin Key Detected." ,
        });
        return;
    }
    var name1 = req.body.name1;
    var name2 = req.body.name2;    
    var name3 = req.body.name3;
    var name4 = req.body.name4;
    var mp1 = parseInt(req.body.mp1);
    var mp2 = parseInt(req.body.mp2);
    var mp3 = parseInt(req.body.mp3);
    var mp4 = parseInt(req.body.mp4);
    scenecontrol.setVoteOption(0,name1,mp1);
    scenecontrol.setVoteOption(1,name2,mp2);
    scenecontrol.setVoteOption(2,name3,mp3);
    scenecontrol.setVoteOption(3,name4,mp4);
    //thaaaaaaaaaaaaaaaat should probably be a loop. or straight passed as an object
    //console.log(req.body.name);
    var feedback = scenecontrol.getVoteForm();
    var feedbackString = `Vote form set to ${feedback.names[0]} for ${feedback.mps[0]}mp, ${feedback.names[1]} for ${feedback.mps[1]}mp, ${feedback.names[2]} for ${feedback.mps[2]}mp, and ${feedback.names[3]} for ${feedback.mps[3]}mp.`;
    console.log(feedbackString);
    

    res.json({
        response: 0 ,
        responseM: feedbackString ,
    }
    ) 
});

app.get('/api/clearvotes/:adminkey/', (req, res) => {
    if (adminkey != parseInt(req.params.adminkey) ){
        res.send("Invalid admin key");
        console.log("Invalid admin key detected.");
        return;
    }
    scenecontrol.clearTallies();
    res.send(`Cleared Tallies`);
})


/*
app.get('/api/clientresults/:phaseId/:hp/:mp', async (req, res) => {
    var phaseId = parseInt(req.params.phaseId);
    var theHP =  parseInt(req.params.hp);
    var theMP =  parseInt(req.params.mp);
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    if ( phaseId != currentPhaseId ){
        console.log("Client results recieved, but they look old (invalid phase ID.) Discarding.");
        res.send("Discarding your results due to invalid phase ID. Possible late or desync issue? Yell at Gloop.");
    } else {
        scenecontrol.updateRoundVars(theHP,theMP);
        res.send("Recieved!");
    }

    
})
    */

    /*
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    if ( parseInt(req.params.phaseId) != currentPhaseId ){
        console.log("Client results recieved, but they look old (invalid phase ID.) Discarding.");
        return;
    }
    scenecontrol.updateRoundVars(1,1);
    */

//const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);




// gloop this was a bad idea and in your heart you know it
function secondsSolver(someNum){
    var a = someNum + delaySeconds;
    if ( a >= 60){
        a = a - 60;
    }
   return a;
}

// Routes
app.use("/api/responders", responders.respondersRouterCreator(app));

/*
app.get('/api/pageset/:num', (req, res) => {
    var pageInt = parseInt(req.params.num);
    console.log("before:"+pageInt);
    scenecontrol.currentPage = pageInt;
    console.log("after"+pageInt);
    res.send("Page Set:"+ pageInt); 
})
*/

// Will be set either by dotenv on local or Vercel on preview/production
const port = process.env.PORT;
app.listen(port, () =>{
    console.log(`Listening on ${port}.`);
})

module.exports = app;