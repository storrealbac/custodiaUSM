const Datastore = require("nedb");
const path = require("path");


const ACTIVE_USERS_PATH = path.join(__dirname, "..", "..", "data", process.env.ACTIVE_USERS_DATABASE);
const PENALTY_USERS_PATH = path.join(__dirname, "..", "..", "data", process.env.PENALTY_USERS_DATABASE);
const HISTORICAL_PATH = path.join(__dirname, "..", "..", "data", process.env.HISTORICAL_DATABASE);


const activeUsersDB = new Datastore({filename: ACTIVE_USERS_PATH, autoload: true});
const penaltyUsersDB = new Datastore({filename: PENALTY_USERS_PATH, autoload: true});
const historicalDB = new Datastore({filename: HISTORICAL_PATH, autoload: true});

module.exports = {
    activeUsersDB,
    penaltyUsersDB,
    historicalDB
}