let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./index");
const expect = require("chai").expect
chai.should();
chai.use(chaiHttp);

describe("Test for different APIs", function(){
    it("Should return user profile", function(done) {
        chai.request(server)
        .get('/profile?user_id=4')
        .send({
        })
        .end(function (err, res) {
            expect(res.body[0].Email).to.equal("xichao@gmail.com");
            done();
        });
    });

    it("Should return status code 200 and user info when login successful", function(done) {
        chai.request(server)
        .post('/login')
        .send({
        password: '123', 
        email: 'xichao@gmail.com'
        })
        .end(function (err, res) {
            expect(res.statusCode).to.equal(200);   
            expect(res.body.email).to.equal('xichao@gmail.com');
            expect(res.body.name).to.equal('charlie');
            done();
        });
    });
    it("Should return status code 401 when sign up with existed email", function(done) {
        chai.request(server)
        .post('/signup')
        .send({
        email: 'xichao@gmail.com',
        name: 'charlie',
        password: '123'
        })
        .end(function (err, res) {
            expect(res.statusCode).to.equal(401);
            done();
        });
    });
    it("Should return 404 when settle up with not existed user", function(done) {
        chai.request(server)
        .post('/settleup')
        .send({
            user_id: '9999'
        })
        .end(function (err, res) {
            expect(res.statusCode).to.equal(404);
            done();
        });
    });

    it("Should return status code 200 when user update profile", function(done) {
        chai.request(server)
        .post('/profile?user_id=4')
        .send({
            user_id: '4',
            email: 'xichao@gmail.com',
            name: 'charlie',
            phone: '12345',
            pircture: '1',
            currency: '1',
            timezone: 'America/New_York',
            language: '1'

        })
        .end(function (err, res) {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });
    
            
})

