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