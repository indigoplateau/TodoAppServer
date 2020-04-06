var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Todo = require('./Todos');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var mongoose = require('mongoose');

//testing

var app = express();
module.exports = app; // for testing
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());


var router = express.Router();


//**************** TODOS ROUTING *******************

router.route('/todos')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        //check if received JSON has minimum required fields
        if (!req.body.name || !req.body.users) {
            res.json({success: false, message: 'Error,  Empty required fields.'});
        }
        else {

            //creation of temp schema
            var todo = new Todo();

            todo.name = req.body.name;
            todo.users = req.body.users;


            //creates a unique object id for task.
            //NOTE: It is an object. to convert use todo.taskID.toString()
            todo.taskID = mongoose.Types.ObjectId();

            //creating dates

            if(req.body.dateDue){
                todo.dateDue = new Date(JSON.stringify(req.body.dateDue));
            }

            todo.dateCreated = new Date();

            //setting priority

            if(req.body.priority){

                //check to see if string is valid

                if(req.body.priority  === "low" || req.body.priority  === "medium" || req.body.priority  === "high"){
                    todo.priority = req.body.priority;
                }
                else{

                    res.json({success: false, message: 'Error,  priority string incorrect.'});

                }

            }

            //setting status

            if(req.body.status){

                //check to see if string is valid

                if(req.body.priority  === "low" || req.body.priority  === "medium" || req.body.priority  === "high"){
                    todo.status = req.body.status;
                }
                else{

                    res.json({success: false, message: 'Error,  status string incorrect.'});

                }

            }

            //creating task and saving to database

            Todo.create({ _id: todo.taskID, name: todo.name, dateCreated: todo.dateCreated, dateDue: todo.dateDue, priority: todo.priority, status: todo.status, users: todo.users }, function (err) {
                if(err){
                    res.json(err);
                }
                else{
                    res.json({success: true, _id: todo.taskID, name: todo.name, dateCreated: todo.dateCreated, dateDue: todo.dateDue, priority: todo.priority, status: todo.status, users: todo.users });
                }
            });

        }

    })
    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        //sorry about confusing variable names but its being cranky
        // id is the document id
        // update is the field to update
        // replacement is the value to update to document

        if (!req.body.id || !req.body.update || !req.body.replacement) {
            res.json({success: false, message: 'Error,  Empty fields.'});
        }

        const filter = { _id: mongoose.Types.ObjectId(req.body.id) };
        console.log(filter);
        var update = req.body.update;
        var args = {};
        args[update] = req.body.replacement;
        console.log(args);


        Todo.findOneAndUpdate(filter, args, function(err, result) {
            if (err) {
                res.json({success: false, message: 'Error,  failed to update todo.'});
            }
            else {
                res.json({ success: true, message: 'Todo Updated.' });
            }
        });

    })
    .delete(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        //json  must have of todo id

        if (!req.body.id) {
            res.json({success: false, message: 'Error,  Empty id field.'});
        }


        Todo.findOneAndDelete({'_id':mongoose.Types.ObjectId(req.body.id)})
            .then(deletedDocument => {
                if(deletedDocument) {
                    res.json({ success: true, message: 'Todo Deleted.' });
                }
                else {
                    res.json({success: false, message: 'Error,  no matching todo found.'});
                }
            })
            .catch(err => console.error(`Failed to find and delete todo: ${err}`))

    });


router.route('/todos/:username')
    .get(authJwtController.isAuthenticated, function (req, res) {
         var name = req.params.username;
        //for id we use :userId
        /*var id = req.params.userId;
        var userJson;

        User.findById(id, function(err, user) {
            if (err) res.send(err);

            userJson = JSON.stringify(user);
        });

        var name =userJson.name;
*/

        Todo.find( { users: { $elemMatch: { userName :name} }}, function (err, todo) {

            if(err){
                res.json({ success: false, message: 'Todos could not be found. Check id.' });
            }
            else{
                console.log(todo);
                res.json(todo);
            }

        }  );

    });


//**************** USERS ROUTING *******************

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    //userNew.name = req.body.name;
    console.log(req.body.username);
    console.log(req.body.password);
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        try{
            user.comparePassword(userNew.password, function(isMatch){
                if (isMatch) {
                    var userToken = {id: user._id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, message: 'Authentication failed.'});
                }
            })
        }
        catch(err){
            res.status(401).send({success: false, message: 'Authentication failed. User not known or ' + err.name}) //user not know  for debugging purposes
        }


    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
