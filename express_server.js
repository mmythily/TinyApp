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
        password: "purple" //"purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID", 
        email: "user2@example.com", 
        password: "funk" //"dish-washer-funk"
    },
    "user2RandomIC": {
        id: "user2RandomID", 
        email: "user3@example.com", 
        password: "funk" //"dish-washer-funk"
    }
}

emailLookup = (checkEmail) => {
    for (let key in users){
        if (users[key].email == checkEmail ){
            return true;
        }
    }
    return false;
}

//console.log('does this email exist in the database?',  emailLookup("user3@eample.com"))


//registers a handler on the root path, "/".
app.get("/", (req, res) => {
    res.send("Hello!");
});

// get/register endpoint
app.get('/register', (req, res) => {
    res.render("register");
});


app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (emailLookup(email) == true){
        res.status(400).send('400 Error! Email already exists. Go back and login');
    } else if (!email || !password){
        res.status(400).send('400 Error! Please enter a valid email and password');
    }
    else{
        const user_id = `user${generateRandomString(3)}`
        let newUser = {
            id : user_id,
            email : req.body.email,
            password : req.body.password
        };
        users[user_id] = newUser;
        res.cookie('user_id', user_id)
        console.log(users);
        res.redirect("/urls");
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});

//Working with cookies
app.post('/login', (req, res) => {
    console.log(req.body)
    const user_id = req.body.user_id;
    res.cookie('user_id', user_id);
    res.redirect("/urls");
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls");
});

//Rendering with EJS Template Engine and sending data to urls_index page
app.get("/urls", (req, res) => {
    console.log(res.cookies);
    let tempData = { 
        user_id: req.body["user_id"],
        urls: urlDatabase, 
        user : users[req.cookies.user_id]
    };
    //: users[res.cookies.user_id] ? users[res.cookies.user_id] : 'test'
    console.log(tempData);
    // let user = users[req.body["user_id"]];
    //const urls = templateVars.urls
    res.render("urls_index", tempData);

    // let userEmail = users[req.cookies["user_id"]].email;
    // let tempData = { 
    //     user_id: req.cookies["user_id"],
    //     urls: urlDatabase,
    // };
    // //const urls = templateVars.urls
    // res.render("urls_index", tempData, userEmail);
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


app.get("/urls/new", (req, res) => {
    let tempData = { 
        user_id: req.cookies["user_id"],
        urls: urlDatabase 
    };
    res.render("urls_new", tempData);
});


//Accessing current record
app.get("/urls/:shortURL", (req, res) => {
    let tempData = { 
        user_id: req.cookies["user_id"],
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL] 
    };
    res.render("urls_show", tempData);
});

//Updating record = POST route that updates a URL resource; POST /urls/:id
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    urlDatabase[shortURL] = req.body.longURL;
    console.log(urlDatabase)
    res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
    //const shortURL = req.params.shortURL;
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
});

//Deleting record
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});