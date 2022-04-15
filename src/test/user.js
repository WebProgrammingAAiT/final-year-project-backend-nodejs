process.env.NODE_ENV = "test";
import chai, { use} from "chai";
import chaiHttp from "chai-http";
import app from "../index.js";
const { expect } = chai;
use(chaiHttp);

describe("User API",() =>{
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
});