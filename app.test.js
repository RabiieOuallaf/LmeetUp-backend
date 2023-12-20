const request = require('supertest');
const app = require('./index');

describe("POST /superAdmin/signIn", () => {
    describe("when passed a username and password", () => {
    // should save the username and password in the database
    // should respond with a json object that contains the id from the database. (probably jwt in the real world)
    // should respond with a 200 status code
    // should specify json as the content type in the http header.
    })
  
    describe("when the username or password is missing", () => {
    // should return a 400 status code to show there was a user error.
    // should return a json object that contains an error message.
    // should specify json as the content type in the http header.
    })
})
