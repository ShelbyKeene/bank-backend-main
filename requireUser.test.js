const { requireUser } = require('./authUtils'); // Update the path accordingly
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { expect } = chai;

describe('requireUser middleware', () => {
    it('should console log req.user when user is present', (done) => {
        const req = {
          user: {
            id: 123, // Sample user ID
            username: 'john_doe', // Sample username
            // Add other user properties here
          },
        };
      
        const res = {};
        const next = () => {
          expect(req.user).to.exist;
          console.log(req.user); // Log req.user
          done();
        };
      
        requireUser(req, res, next);
      });
      

  it('should return a 401 error when user is missing', (done) => {
    const req = {};

    const res = {
      status: (statusCode) => {
        expect(statusCode).to.equal(401);
        return res; // Return the response object for chaining
      },
      json: (data) => {
        expect(data.error).to.equal('no user');
        expect(data.name).to.equal('MissingUserError');
        expect(data.message).to.equal('You must be logged in to perform this action');
        done();
      },
    };

    const next = () => {
      done(new Error('next should not be called'));
    };

    requireUser(req, res, next);
  });
});
