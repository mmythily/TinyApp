const express = require('express');
const cookieParser = require('cookie-parser')

//body-parser library will convert the request body from a Buffer into string that we can read. 
//It will then add the data to the req(request) object under the key body.
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

    //registers a handler on the root path, "/".
app.get("/", (req, res) => {
    res.send("Hello!");
});


//Rendering with EJS Template Engine and sending data to urls_index page
app.get("/urls", (req, res) => {
    let tempData = { urls: urlDatabase };
    //const urls = templateVars.urls
    res.render("urls_index", tempData);
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
    res.redirect(`/urls/${shortURL}`);   //redirection is 301 status code  
});

app.get("/u/:shortURL", (req, res) => {
    //const shortURL = req.params.shortURL;
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
});


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
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;

    urlDatabase[shortURL] = req.body.longURL;
    console.log(urlDatabase)
    res.redirect("/urls")
})

//Deleting record
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
})

//Working with cookies
app.post('/login', (req, res) => {

    console.log(req.body)
    const username = req.body.user;
    res.cookie('user', username);
    res.redirect("/urls", {});
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})