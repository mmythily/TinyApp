const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const PORT = 8080;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID"},
    "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"}
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
        if (users[key].email === checkEmail ){
            return users[key];
        }
    }
    return false;
}

urlsForUser = (id) => {
    const urls = [];
    for (let shortURL in urlDatabase){
        if (urlDatabase[shortURL].userID === id){
            urls[shortURL] = urlDatabase[shortURL];
        }
    }
    return urls;
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
            password : bcrypt.hashSync(req.body.password, 10)
        };
        users[user_id] = newUser;
        res.cookie('user_id', user_id)
        res.redirect("/urls");
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const userlog = emailLookup(email);
    //bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); /
    bcrypt.compareSync(req.body.password, userlog.password); 
    const user = emailLookup(email);
    if (user === false){
        res.status(403).send('Forbidden : 403 Error! Email cannot be found');
    } 
    //else if (user.password !== password){
    else if (!bcrypt.compareSync(req.body.password, userlog.password)){
        res.status(403).send('Forbidden : 403 Error! You entered a wrong password for your email. Try Again');
    }
    else if (!email || !req.body.password){
        res.status(400).send('Bad Request : 400 Error! Please enter a valid email and password');
    }
    else { //emailLookup(email) == true
        res.cookie('user_id', user.id);
        res.redirect("/urls");
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/login");
});

//Rendering with EJS Template Engine and sending data to urls_index page
app.get("/urls", (req, res) => {
    const userID = req.cookies.user_id;
    let tempData = { 
        urls: urlsForUser(userID), 
        user: users[userID]
    };
    res.render("urls_index", tempData);
});

app.post("/urls", (req, res) => {
    const userID = req.cookies.user_id;
    if (userID === undefined){
        res.status(403).send("Forbidden : 403 Error! Please log in to create short url")
    } else {
        const shortURL = generateRandomString(6);
        const longURL = req.body.longURL;
        urlDatabase[shortURL] = { longURL, userID};
        res.redirect(`/urls/${shortURL}`);
        //redirection is 301 status code  
    }
});


app.get("/urls/new", (req, res) => {
    const user_id = req.cookies.user_id;
    if (user_id === undefined){
        res.status(403).send("Forbidden : 403 Error! Please log in to create short url");
    }
    else {
        let tempData = { 
            user_id: req.cookies["user_id"],
            urls: urlDatabase,
            user: users[req.cookies.user_id]
        };
        res.render("urls_new", tempData);
    }
});


//Accessing current record
app.get("/urls/:shortURL", (req, res) => {
    const user_id = req.cookies.user_id;
    if (user_id === undefined){
        res.status(403).send("Forbidden : 403 Error! Please log in to access your record")
    } else {
        let tempData = { 
            user_id: req.cookies["user_id"],
            shortURL: req.params.shortURL, 
            longURL: urlDatabase[req.params.shortURL].longURL,
            user : users[req.cookies.user_id].userID
        };
        res.render("urls_show", tempData);
    }
});

//Updating record = POST route that updates a URL resource; POST /urls/:id
app.post("/urls/:id", (req, res) => {
    const user_id = req.cookies.user_id;
    if (user_id === undefined){
        res.status(403).send("Forbidden : 403 Error! Please log in to edit short url")
    }
    else {
        const shortURL = req.params.id;
        urlDatabase[shortURL].longURL = req.body.longURL;
        res.redirect("/urls")
    }
});

app.get("/u/:shortURL", (req, res) => {
    //const shortURL = req.params.shortURL;
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
});

//Deleting record
app.post("/urls/:shortURL/delete", (req, res) => {
    const user_id = req.cookies.user_id;
    if (user_id === undefined){
        res.status(403).send("Forbidden : 403 Error! Please log in to delete short url")
    }
    else {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});