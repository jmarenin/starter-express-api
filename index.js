// const express = require('express')
// const app = express()
// app.all('/', (req, res) => {
//     console.log("Just got a request!")
//     res.send('Yo!')
// })
// app.listen(process.env.PORT || 3000)

// Include the cluster module
// var cluster = require('cluster');
var cors = require('cors');
var mysql      = require('mysql');
const fs = require('fs');

require("core-js/actual/array/group-by");
// var connection = mysql.createConnection({
//   host     : 'awseb-e-tet8fpbaaf-stack-awsebrdsdatabase-hmwmgkshply0.ctfttuokbo5t.us-west-1.rds.amazonaws.com',
//   user     : 'jmarenin',
//   password : 'joeyjoeyjoey',
//   //database: 'ebdb',
//   port     : 3306
// });

// // Code to run if we're in the master process
// if (cluster.isMaster) {

//     // Count the machine's CPUs
//     var cpuCount = require('os').cpus().length;

//     // Create a worker for each CPU
//     for (var i = 0; i < cpuCount; i += 1) {
//         cluster.fork();
//     }

//     // Listen for terminating workers
//     cluster.on('exit', function (worker) {

//         // Replace the terminated workers
//         console.log('Worker ' + worker.id + ' died :(');
//         cluster.fork();

//     });

// // Code to run if we're in a worker process
// } else {
    // var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');

    // AWS.config.region = process.env.REGION
    var app = express();

    // app.set('view engine', 'ejs');
    // app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(cors());

    function createConnection() {
        return mysql.createConnection({
            host     : 'dyeleaguemysql.mysql.database.azure.com',
            user     : 'jmarenin',
            password : 'Joeyjoeyjoey13',
            database: 'dyeleague',
            port     : 3306,
            ssl:{ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem")}
          });
    }
    
    app.get('/', async (req, res) => {
        res.send("Hello");
    });

    app.get('/test', async (req, res) => {
        var connection = createConnection();
        
        connection.connect(function(err) {
            if (err) {
                res.send("Database connection failed: " + err.stack);
                return;
            }

            res.send('Connected to the database');
            connection.end();
        });
    });

    app.get('/conferences', async (req, res) => {
        var connection = createConnection();
        
        connection.connect(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send(err).end();
                return;
            }
            
            var sqlquery = "SELECT * FROM CONFERENCES"
            connection.query(sqlquery, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(400).end();
                }
                
                console.log(result);
                res.send(result);
                connection.end();
            });
        });
    });

    app.get('/teams', async (req, res) => {
        var connection = createConnection();
        
        
        connection.connect(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send(err).end();
                return;
            }
           
            var sqlquery;
            if (req.query.id !== undefined) {
                sqlquery = `SELECT * FROM TEAMS WHERE ID = ${req.query.id}`;
            }
            else if (req.query.conference !== undefined) {
                sqlquery = `SELECT * FROM TEAMS WHERE CONFERENCE = ${req.query.conference}`;
            }
            else {
                sqlquery = "SELECT * FROM TEAMS"
            }
            connection.query(sqlquery, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(400).end();
                }
                
                console.log(result);
                res.send(result);
                connection.end();
            });
        });
    });

    app.get('/games', async (req, res) => {
        var connection = createConnection();
        
        
        connection.connect(function(err) {
            if (err) {
                res.status(400).send(err).end();
                return;
            }
            
            var sqlquery;
            if (req.query.week !== undefined) {
                sqlquery = "SELECT GAMES.ID, WEEK_NUM, T1.TNAME as T1, T1.ID as T1_ID, T2.TNAME as T2, T2.ID as T2_ID,"
                            + " ifnull(T1_SCORE, '--') as T1_SCORE, ifnull(T2_SCORE, '--') as T2_SCORE FROM GAMES"
                                + " JOIN TEAMS AS T1 ON GAMES.T1 = T1.ID"
                                + " JOIN TEAMS AS T2 ON GAMES.T2 = T2.ID"
                            + ` WHERE WEEK_NUM = ${req.query.week}`
                            + " ORDER BY GAMES.ID;";
            }
            else if (req.query.team !== undefined) {
                sqlquery = "SELECT GAMES.ID, WEEK_NUM, T1.TNAME as T1, T1.ID as T1_ID, T2.TNAME as T2, T2.ID as T2_ID,"
                            + " ifnull(T1_SCORE, '--') as T1_SCORE, ifnull(T2_SCORE, '--') as T2_SCORE FROM GAMES"
                                + " JOIN TEAMS AS T1 ON GAMES.T1 = T1.ID"
                                + " JOIN TEAMS AS T2 ON GAMES.T2 = T2.ID"
                            + ` WHERE GAMES.T1 = ${req.query.team} OR GAMES.T2 = ${req.query.team}`
                            + " ORDER BY GAMES.ID;";
            }
            else {
                sqlquery = "SELECT GAMES.ID, WEEK_NUM, T1.TNAME as T1, T1.ID as T1_ID, T2.TNAME as T2, T2.ID as T2_ID,"
                            + " ifnull(T1_SCORE, '--') as T1_SCORE, ifnull(T2_SCORE, '--') as T2_SCORE FROM GAMES"
                                + " JOIN TEAMS AS T1 ON GAMES.T1 = T1.ID"
                                + " JOIN TEAMS AS T2 ON GAMES.T2 = T2.ID"
                            + " ORDER BY GAMES.ID;";
            }
            connection.query(sqlquery, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(400).end();
                }
                
                if (req.query.team === undefined && req.query.group === undefined)
                    res.send(result.groupBy(x => x.WEEK_NUM));
                else
                    res.send(result);
                connection.end();
            });
        });
    });
    
    app.get('/standings', async (req, res) => {
        var connection = createConnection();
        
        
        connection.connect(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send(err).end();
                return;
            }
            
            // const sqlquery =
            //     SELECT TEAMS.ID as ID, P1, P2, CONFERENCE, TNAME, ifnull(WINS, 0) as WINS, ifnull(LOSSES, 0) + (12 - (ifnull(WINS, 0) + ifnull(LOSSES, 0))) as LOSSES, 
            //     ifnull(ifnull(WINS, 0) / 12.0, 0.0) as WP, ifnull(wins.PD,0) + ifnull(losses.PD,0) as PD FROM 
            //     TEAMS 
            //     LEFT JOIN 
            //         (SELECT TEAMS.ID, COUNT(*) as WINS, SUM(ABS(T1_SCORE - T2_SCORE)) as PD FROM TEAMS 
            //         JOIN GAMES ON (TEAMS.ID = GAMES.T1 OR TEAMS.ID = GAMES.T2) AND TEAMS.ID = GAMES.WINNER 
            //         GROUP BY TEAMS.ID) as wins ON TEAMS.ID = wins.ID 
            //     LEFT JOIN 
            //         (SELECT TEAMS.ID, COUNT(*) as LOSSES, SUM(ABS(T1_SCORE - T2_SCORE)) * -1 as PD FROM TEAMS 
            //         JOIN GAMES ON (TEAMS.ID = GAMES.T1 OR TEAMS.ID = GAMES.T2) AND WINNER IS NOT NULL AND WINNER != TEAMS.ID 
            //         GROUP BY TEAMS.ID) as losses ON TEAMS.ID = losses.ID 
            //     ORDER BY WP DESC, WINS DESC, PD DESC;

            const sqlquery = "SELECT TEAMS.ID as ID, P1, P2, CONFERENCE, TNAME, ifnull(WINS, 0) as WINS, ifnull(LOSSES, 0) + (12 - (ifnull(WINS, 0) + ifnull(LOSSES, 0))) as LOSSES, " +
            "	ifnull(ifnull(WINS, 0) / 12.0, 0.0) as WP, ifnull(wins.PD,0) + ifnull(losses.PD,0) as PD FROM " +
            "	TEAMS " +
            "	LEFT JOIN " +
            "		(SELECT TEAMS.ID, COUNT(*) as WINS, SUM(ABS(T1_SCORE - T2_SCORE)) as PD FROM TEAMS " +
            "		JOIN GAMES ON (TEAMS.ID = GAMES.T1 OR TEAMS.ID = GAMES.T2) AND TEAMS.ID = GAMES.WINNER " +
            "		GROUP BY TEAMS.ID) as wins ON TEAMS.ID = wins.ID " +
            "	LEFT JOIN " +
            "		(SELECT TEAMS.ID, COUNT(*) as LOSSES, SUM(ABS(T1_SCORE - T2_SCORE)) * -1 as PD FROM TEAMS " +
            "		JOIN GAMES ON (TEAMS.ID = GAMES.T1 OR TEAMS.ID = GAMES.T2) AND WINNER IS NOT NULL AND WINNER != TEAMS.ID " +
            "		GROUP BY TEAMS.ID) as losses ON TEAMS.ID = losses.ID " +
            "	ORDER BY WP DESC, WINS DESC, PD DESC;";
            
            connection.query(sqlquery, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(400).end();
                }
                
                console.log(result);
                res.send(result);
                connection.end();
            });
        });

    });

    app.put('/submit', async (req, res) => {
        var connection = createConnection();
        
        
        connection.connect(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send(err).end();
                return;
            }

            console.log(req.query);
            
            const id = req.query.id;
            const t1_score = Number(req.query.T1_SCORE);
            const t2_score = Number(req.query.T2_SCORE);
            var winner;

            if (t1_score > t2_score)
                winner = 'T1';
            else
                winner = 'T2';

            const sqlquery = `UPDATE GAMES SET T1_SCORE = ${t1_score}, T2_SCORE = ${t2_score}, WINNER = ${winner} WHERE ID = ${id}`
            
            connection.query(sqlquery, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).end();
                }
                
                console.log(result);
                res.send(result);
                connection.end();
            });
        });

    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
//}