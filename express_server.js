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

function generateRandomString (randomString) {
    const randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}
app.post("/urls", (req, res) => {

    console.log(req.body);  // Log the POST request body to the console
    const shortURL = generateRandomString(6);
    const longURL = input.longURL;
    urlDatabase[shortURL] = longURL;
    res.send(`Awesome! The machine generated ${shortURL} for ${longURL}.`);         
});

app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    res.redirect(longURL);
});

app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL] 
    };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    res.redirect("urls_index");
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})