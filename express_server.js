const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

const PORT = 8080;

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['brew'],
    maxAge: 24 * 60 * 60 * 1000 //24 hours
    // req.session.user_id : req.session.user_id
}))

var urlDatabase = {};
var users = {};

const generateRandomString = (strLength) => {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < strLength; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}

const emailLookup = (checkEmail) => {
    for (let key in users){
        if (users[key].email === checkEmail ){
            return users[key];
        }
    }
    return false;
}

const urlsForUser = (id) => {
    const urls = [];
    for (let shortURL in urlDatabase){
        if (urlDatabase[shortURL].userID === id){
            urls[shortURL] = urlDatabase[shortURL];
        }
    }
    return urls;
 }

//root path, which redirects to url list or login depending on whether user is logged in
app.get('/', (req, res) => {
    if(req.session.user_id == true){
        res.redirect('/urls');
    }
    else{
        res.redirect('/login');
    }
});


// get/register endpoint that renders registration page
app.get('/register', (req, res) => {
    let tempData = { 
        urls: urlDatabase, 
        user: users[req.session.user_id]
    };
    res.render('register', tempData);
});

//Creates and authenticates a new user
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
        req.session['user_id'] = user_id;
        res.redirect('/urls');
    }
});

//login page
app.get('/login', (req, res) => {
    res.render('login');
});

//Authenticate a user based on their email and password and set a session cookie
app.post('/login', (req, res) => {
    const email = req.body.email;
    const user = emailLookup(email);
    if (user === false){
        res.status(403).send('Forbidden : 403 Error! Email cannot be found');
    } 
    else if (!bcrypt.compareSync(req.body.password, user.password)){
        res.status(403).send('Forbidden : 403 Error! You entered a wrong password for your email. Try Again');
    }
    else if (!email || !req.body.password){
        res.status(400).send('Bad Request : 400 Error! Please enter a valid email and password');
    }
    else { 
        req.session['user_id']= user.id;
        res.redirect('/urls');
    }
});

//Destroy the session and return to login page
app.post('/logout', (req, res) => {
    res.session = null;
    res.redirect('/login');
});

//Rendering with EJS Template Engine and sending data to urls_index page
app.get('/urls', (req, res) => {
    const userID = req.session.user_id;
    let tempData = { 
        urls: urlsForUser(userID), 
        user: users[userID]
    };
    res.render('urls_index', tempData);
});

//Generate urls for associate it with the user
app.post('/urls', (req, res) => {
    const userID = req.session.user_id;
    if (!userID){
        res.status(403).send('Forbidden : 403 Error! Please log in to create short url')
    } else {
        const shortURL = generateRandomString(6);
        const longURL = req.body.longURL;
        urlDatabase[shortURL] = { longURL, userID};
        res.redirect(`/urls/${shortURL}`);
    }
});

//Users can add and edit new urls
app.get('/urls/new', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id){
        res.status(403).send('Forbidden : 403 Error! Please log in to create short url');
    }
    else {
        let tempData = { 
            user_id: req.session['user_id'],
            urls: urlDatabase,
            user: users[req.session.user_id]
        };
        res.render('urls_new', tempData);
    }
});

//Accessing current record
app.get('/urls/:shortURL', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        res.status(403).send('Forbidden : 403 Error! Please log in to access your record')
    } else if (!users[user_id]){
        res.session = null;
        res.redirect('/login')
    }
    else {
        let tempData = { 
            user_id: req.session['user_id'],
            shortURL: req.params.shortURL, 
            longURL: urlDatabase[req.params.shortURL].longURL,
            user : users[user_id].userID
        };
        res.render('urls_show', tempData);
    }
});

//Updating record = POST route that updates a URL resource; POST /urls/:id
app.post('/urls/:id', (req, res) => {
    const user_id = req.session.user_id;
    const shortURL = req.params.id;

    if (!user_id){
        res.status(403).send('Forbidden : 403 Error! Please log in to edit short url')
    } else if (user_id === urlDatabase[shortURL].userID){
        urlDatabase[shortURL].longURL = req.body.longURL;
        res.redirect('/urls')
    } else {
        res.redirect('/login')
    }
});

//Shows the longurl of the shorturl
app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

//Delete a record
app.post('/urls/:shortURL/delete', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id){
        res.status(403).send('Forbidden : 403 Error! Please log in to delete short url');
    }
    else {
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');
    }
});


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});