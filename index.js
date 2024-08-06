const express = require('express');
const scenecontrol = require('./scenecontrol.js');
const app = express();
var cors = require('cors');

app.use(cors());

scenecontrol.setCurrentPage(2);

const delaySeconds = 7;


app.get('/', (req, res) =>{
    res.send("hello world!");
});

app.get('/api/courses', (req, res) =>{
    res.send([1,2,3]);
});

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

app.get('/api/pageset/:num', (req, res) => {
    var pageInt = parseInt(req.params.num);
    console.log(scenecontrol.currentPage());
    scenecontrol.setCurrentPage(pageInt);
    console.log(scenecontrol.currentPage());
    res.send("Page Set:"+ scenecontrol.currentPage()); 
})


function secondsSolver(someNum){
    var a = someNum + delaySeconds;
    if ( a >= 60){
        a = a - 60;
    }
   return a;
}


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