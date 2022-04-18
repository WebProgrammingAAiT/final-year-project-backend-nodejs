process.env.NODE_ENV = "test";
import chai, { use} from "chai";
import chaiHttp from "chai-http";
import app from "../index.js";
const { expect } = chai;
use(chaiHttp);

describe("User API",() =>{
    let tokens;
    let userTokens;
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
    
    it("It should authenticate user", async () => {
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "lensa",
                "password": "123456"
            });
        expect(response).to.have.status(200);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("accessToken");
        expect(response.body).to.have.property("msg").eql('Login Successful.');
     
      });
    
      it("It should register user", async () => {
        let response = await chai
          .request(app)
          .post("/api/signup")
          .send({
            username: "mahi",
            password: "UnitTesting",
            email: "user@test.com",
            role: "propertyAdminUser",
          }).set('Authorization', 'JWT ' + tokens);
        expect(response).to.have.status(201);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("msg").eql('User registered successfully');
      });
      
    // it("It should update user's password", async () => {
    //     let response = await chai
    //       .request(app)
    //       .put('/api/account/changePassword')
    //       .send({
    //         emailOrUsername: "mahi",
    //         newPassword: "123456",
    //       }).set('Authorization', 'JWT ' + tokens);
    //     expect(response).to.have.status(200);
    //     expect(response.body).to.be.a("object");
    //     expect(response.body).to.have.property("msg").eql('Password changed successfully');
    //   });
    it("It should update user's department", async () => {
        let response = await chai
          .request(app)
          .put('/api/user/changeDepartment')
          .send({
            emailOrUsername: "neba",
            departmentId:"624c33a58a6223667774a9f8"
          }).set('Authorization', 'JWT ' + tokens);
        expect(response).to.have.status(200);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("msg").eql('Department changed successfully');
      });
    
    it("It should logout user", async () => {
        let response = await chai
          .request(app)
          .post('/api/user/logout')
          .send({
            emailOrUsername: "mahi",
            password: "123456",
          });
        //   console.log(response.body);
        expect(response).to.have.status(200);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("msg").eql('Logout successful.');
      });
    it("It should refresh user's token", async () => {
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "lensa",
                "password": "123456"
            });
        expect(response).to.have.status(200);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("accessToken");
        expect(response.body).to.have.property("msg").eql('Login Successful.');
        userTokens = response.header["set-cookie"][0];
        response = await chai
          .request(app)
          .post('/api/user/refreshToken')
          .send({
            emailOrUsername: "mahi",
            password: "123456",
          }).
          set('Cookie', userTokens);
        expect(response).to.have.status(200);
        expect(response.body).to.be.a("object");
        expect(response.body).to.have.property("accessToken");
      });

});