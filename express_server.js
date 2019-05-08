const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

    //registers a handler on the root path, "/".
app.get("/", (req, res) => {
    res.send("Hello!");
});


//Added Routes and endpoints
// app.get("/urls.json", (req, res) => {
    //     res.json(urlDatabase);
    // });
    
    // app.get("/hello", (req, res) => {
        //     res.send("<html><body>Hello <b>World</b></body></html>\n");
        // }); 
        //When curl -i http://localhost:8080/hello
        /*Response: 
        HTTP/1.1 200 OK
        X-Powered-By: Express
        Content-Type: text/html; charset=utf-8
        Content-Length: 45
        ETag: W/"2d-+kq4PwugtS0rt17Ooq6yKzvojSE"
        Date: Tue, 07 May 2019 23:02:56 GMT
Connection: keep-alive
*/

//Rendering with EJS Template Engine and sending data to urls_index page
app.get("urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: /* What goes here? */ };
    res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})