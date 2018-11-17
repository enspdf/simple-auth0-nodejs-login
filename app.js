const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

const myVars = {
    domain: process.env.DOMAIN || "shackox.auth0.com",
    clientID: process.env.CLIENT_ID || "rrZsIz9HIOCzZx9Iok4zOKZwV2ykSojX",
    clientSecret: process.env.CLIENT_SECRET || "_0ffIvqILCcgdjUyU89V68VcaNjS76VXUWQIWD7K26r9uxO9XK70MvSf8WUiEIRZ",
    callbackURL: process.env.CALL_BACK_URL || "http://localhost:3000/callback"
}

const strategy = new Auth0Strategy({
    domain: myVars.domain,
    clientID: myVars.clientID,
    clientSecret: myVars.clientSecret,
    callbackURL: myVars.callbackURL
}, (accessToken, refreshToken, extraParam, profile, done) => {
    return done(null, profile);
});

passport.use(strategy);
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: "your_secret_key",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.loggedIn = false;

    if (req.session.passport && typeof req.session.passport.user != "undefined") {
        res.locals.loggedIn = true;
    }

    next();
});

app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/login", passport.authenticate("auth0", {
    domain: myVars.domain,
    clientID: myVars.clientID,
    redirectUri: myVars.callbackURL,
    responseType: "code",
    audience: "https://shackox.auth0.com/userinfo",
    scope: "openid profile"
}), (req, res) => {
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get("/callback", passport.authenticate("auth0", {
    failureRedirect: "failure"
}), (req, res) => {
    res.redirect("/user");
});

app.get("/user", (req, res, next) => {
    res.render("user", {
        user: req.user
    });
});

app.get("/failure", (req, res, next) => {
    res.render("failure");
});

app.listen(3000, () => console.log("Server Running on port 3000"));