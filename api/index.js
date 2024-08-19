const express = require('express');
const scenecontrol = require('./scenecontrol.js');
const defenders = require('./routers/defenders.js');
const app = express();
var cors = require('cors');


// Adding some clumsy security to prevent potential harassment
const THE_WEED_NUMBER = 69;
const adminkey = process.env.ADMINKEY || THE_WEED_NUMBER;



// Express middleware setup
app.use(cors());
app.use(express.json());

// Express local constants initialization
app.locals.currentAttackId = 0;
app.locals.defendersCount = {};

scenecontrol.setCurrentPage(0);

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



app.get('/api/currentpage', (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage);
    console.log(pageInt);
    res.send("Page Is:"+ pageInt); 
})

app.get('/api/currentstatus', (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage());
    var timeInt = parseInt(scenecontrol.epochTime());
    
    var d = new Date();
    let s = secondsSolver(d.getSeconds());

    var currentstatus = pageInt + "|" + timeInt + "|" + s;
    console.log(currentstatus);
    res.send(currentstatus); 
})


app.get('/api/statusjson', (req, res) => {
    var pageInt = parseInt(scenecontrol.currentPage());
    var timeInt = parseInt(scenecontrol.epochTime());
    var theHP = parseInt(scenecontrol.getRoundVars("hp"));
    var theMP = parseInt(scenecontrol.getRoundVars("mp"));
    
    var d = new Date();
    let s = secondsSolver(d.getSeconds());


    res.json({
        thePage: pageInt ,
        currentEpochStamp: timeInt ,
        currentSeconds: s,
        currentAttackId: app.locals.currentAttackId,
        roundHP: theHP,
        roundMP: theMP,
    }
    )
})

/**
 * @todo This should be a PATCH as it's updating an existing resource 
 */
app.get('/api/pageset/:adminkey/:num', (req, res) => {
    // TODO: confirming admin key should be a function or something
    if (adminkey != parseInt(req.params.adminkey) ){
        res.send("Invalid admin key");
        console.log("Invalid admin key detected.");
        return;
    }
    app.locals.currentAttackId++;
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
app.get('/api/clientresults/:attackid/:hp/:mp', (req, res) => {
    var attackID = parseInt(req.params.attackid);
    var theHP =  parseInt(req.params.hp);
    var theMP =  parseInt(req.params.mp);
    var responseCode = 0;
    var responseText;
    if ( attackID == app.locals.currentAttackId ){
        scenecontrol.updateRoundVars(theHP,theMP);
        responseText = `Response for action ${attackID} recieved.`;
    } else {
        console.log(`Recieved but discarding results. Server AttackID is ${app.locals.currentAttackId}, Client said Attack ID ${attackID} HP ${theHP} MP ${theMP}` );
        responseCode = 1;
        responseText = `Response Discarded. Desync issue? Server AttackID ${app.locals.currentAttackId}, You said ${attackID}`;
    }

    res.json({
        response: responseCode ,
        responseM: responseText ,
    }
    ) 

});

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
 * They're doing dummy data rn so I can set up the client.
 */
app.get('/api/getvotetally', (req, res) => {
    var phony1 = Math.floor(Math.random() * 101);
    var phony2 = Math.floor(Math.random() * 101);
    var phony3 = Math.floor(Math.random() * 101);
    var phony4 = Math.floor(Math.random() * 101);
    res.json({
        choice1: phony1,
        choice2: phony2,
        choice3: phony3,
        choice4: phony4,

    })
});

app.post("/api/votechoice/", (req, res) => {
    var responseCode;
    var responseMessage;
    if (req.body.attackid != app.locals.currentAttackId ) {
        responseCode = 1;
        responseMessage = "Invalid Attack ID. Possible Desync issue?";
        console.log("Vote recieved but discarded due to Invalid Phase ID.");
    } else {
        responseCode = 0;
        responseMessage = req.body.voteResponse;
        console.log(`Vote for ${req.body.voteResponse} acccepted.`);
    }
    res.json({
        response: responseCode ,
        responseM: responseMessage ,
    })

})

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




/*
app.get('/api/clientresults/:attackid/:hp/:mp', (req, res) => {
    var attackID = parseInt(req.params.attackid);
    var theHP =  parseInt(req.params.hp);
    var theMP =  parseInt(req.params.mp);
    if ( attackID != app.locals.currentAttackId ){
        console.log("Client results recieved, but they look old (invalid attack ID.) Discarding.");
        res.send("Discarding your results due to invalid attack ID. Possible late or desync issue? Yell at Gloop.");
    } else {
        scenecontrol.updateRoundVars(theHP,theMP);
        res.send("Recieved!");
    }

    
})
    */

    /*
    if ( parseInt(req.params.attackid) != app.locals.currentAttackId ){
        console.log("Client results recieved, but they look old (invalid attack ID.) Discarding.");
        return;
    }
    scenecontrol.updateRoundVars(1,1);
    */

//app.locals.currentAttackId




// gloop this was a bad idea and in your heart you know it
function secondsSolver(someNum){
    var a = someNum + delaySeconds;
    if ( a >= 60){
        a = a - 60;
    }
   return a;
}

// Routes
app.use("/api/defenders", defenders.defendersRouterCreator(app));

/*
app.get('/api/pageset/:num', (req, res) => {
    var pageInt = parseInt(req.params.num);
    console.log("before:"+pageInt);
    scenecontrol.currentPage = pageInt;
    console.log("after"+pageInt);
    res.send("Page Set:"+ pageInt); 
})
*/

const port = process.env.PORT || 3000;
//const port = 5000;
app.listen(port, () =>{
    console.log(`Listening on ${port}.`);
})

module.exports = app;