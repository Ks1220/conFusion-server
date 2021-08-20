var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    // res.send('respond with a resource');
    User.find({}, function (err, users) {
        if (err) return next(err);
        res.json(users);
    });
});

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
        } else {
            if (req.body.firstname) user.firstname = req.body.firstname;
            if (req.body.lastname) user.lastname = req.body.lastname;
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ err: err });
                    return;
                }
                passport.authenticate("local")(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ success: true, status: "Registration Successful!" });
                });
            });
        }
    });
});

router.post("/login", cors.corsWithOptions, passport.authenticate("local"), (req, res) => {
    // if (!req.session.user) {
    //     var authHeader = req.headers.authorization;
    //     if (!authHeader) {
    //         var err = new Error("You are not authenticated!");
    //         res.setHeader("WWW-Authenticate", "Basic");
    //         err.status = 401;
    //         return next(err);
    //     }
    //     var auth = new Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    //     var username = auth[0];
    //     var password = auth[1];
    //     User.findOne({ username: username })
    //         .then((user) => {
    //             if (user === null) {
    //                 var err = new Error("User " + username + " does not exist!");
    //                 err.status = 403;
    //                 return next(err);
    //             } else if (user.password !== password) {
    //                 var err = new Error("Your password is incorrect!");
    //                 err.status = 403;
    //                 return next(err);
    //             } else if (user.username === username && user.password === password) {
    //                 req.session.user = "authenticated";
    //                 res.statusCode = 200;
    //                 res.setHeader("Content-Type", "text/plain");
    //                 res.end("You are authenticated!");
    //             }
    //         })
    //         .catch((err) => next(err));
    // } else {
    //     res.statusCode = 200;
    //     res.setHeader("Content-Type", "text/plain");
    //     res.end("You are already authenticated!");
    // }

    // Use passport
    // It is able to simplify the code as compared to previous solution
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, token: token, status: "You are successfully login!" });
});

router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie("session-id");
        res.redirect("/");
    } else {
        var err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});

module.exports = router;
