const express = require('express');
const cookieParser = require('cookie-parser')
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
        password: "purple" 
    },
    "user2RandomID": {
        id: "user2RandomID", 
        email: "user2@example.com", 
        password: "funk" 
    },
    "user2RandomIC": {
        id: "user2RandomID", 
        email: "user3@example.com", 
        password: "punk" 
    }
}

generateRandomString = (strLength) => {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < strLength; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}

emailLookup = (checkEmail) => {
    for (let key in users){
        if (users[key].email == checkEmail ){
            return true;
        }
    }
    return false;
}

passwordLookup = (checkPassword) => {
    for (let key in users){
        if (users[key].password == checkPassword ){
            return true;
        }
    }
    return false;
}

//registers a handler on the root path, "/".
app.get("/", (req, res) => {
    res.send("Hello! Welcome to Tiny App");
});


// get/register endpoint
app.get('/register', (req, res) => {
    let tempData = { 
        urls: urlDatabase, 
        user: users[req.cookies.user_id]
    };
    res.render("register", tempData);
});


app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    if (emailLookup(email) == true){
        res.status(400).send('400 Error! Email already exists. Go back and login');
    } 
    else if (!email || !password){
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
        res.redirect("/urls");
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});

/*
Update the POST /login endpoint to lookup the email address (submitted via the login from) in the user object.
We needed this same functionality in the register route; if you created a function for looking up users by their email in that step, you can use that function again here! Your code will be so DRY it can dance underwater without getting wet.
If a user with that e-mail cannot be found, return a response with a 403 status code.
If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
*/
app.post('/login', (req, res) => {
    const user_id = req.body.user_id;
    const email = req.body.email;
    const password = req.body.password;
    
    if (emailLookup(email) == false){
        res.status(403).send('Forbidden : 403 Error! Email cannot be found');
    } 
    else if (passwordLookup(password) == false){
        res.status(403).send('Forbidden : 403 Error! You entered a wrong password. Try Again');
    }
    else if (!email || !password){
        res.status(400).send('Bad Request : 400 Error! Please enter a valid email and password');
    }
    else { //emailLookup(email) == true
        email = req.body.email;
        user_id = req.body.user_id;
        res.cookie('user_id', user_id);
        res.redirect("/urls");
    }
});



app.post('/logout', (req, res) => {
    
    res.clearCookie('user_id');
    res.redirect("/urls");
});

//Rendering with EJS Template Engine and sending data to urls_index page
app.get("/urls", (req, res) => {
    let tempData = { 
        urls: urlDatabase, 
        user: users[req.cookies.user_id]
    };
    console.log(tempData)
    res.render("urls_index", tempData);
});


app.post("/urls", (req, res) => {
    const shortURL = generateRandomString(6);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);   //redirection is 301 status code  
});


app.get("/urls/new", (req, res) => {
    let tempData = { 
        user_id: req.cookies["user_id"],
        urls: urlDatabase,
        user : users[req.cookies.user_id]
    };
    console.log("Temp Database", tempData)
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