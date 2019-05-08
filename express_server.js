const express = require('express');
const app = express();

//body-parser library will convert the request body from a Buffer into string that we can read. 
//It will then add the data to the req(request) object under the key body.
const bodyParser = require("body-parser");
const PORT = 8080;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

    //registers a handler on the root path, "/".
app.get("/", (req, res) => {
    res.send("Hello!");
});


//Rendering with EJS Template Engine and sending data to urls_index page
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    //const urls = templateVars.urls
    res.render("urls_index", templateVars);
});

function generateRandomString(strLength) {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < strLength; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}

app.post("/urls", (req, res) => {
    console.log('post /urls', req.body);  // Log the POST request body to the console
    const shortURL = generateRandomString(6);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    console.log('new db', urlDatabase)
    res.send(`Awesome! The machine generated ${shortURL} for ${longURL}.`);         
});

//Looking 
app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    res.redirect(longURL);
});


//A
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});


//Accessing current record
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL] 
    };
    res.render("urls_show", templateVars);
});

//Updating record = POST route that updates a URL resource; POST /urls/:id
app.post("/urls/:shortURL", (req, res) => {

})

//Deleting record
app.post("/urls/:shortURL/delete", (req, res) => {
    res.redirect("urls_index");
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})