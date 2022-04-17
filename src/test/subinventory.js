process.env.NODE_ENV = "test";

import chai, { use} from "chai";
import chaiHttp from "chai-http";
import app from "../index.js";
import Subinventory from "../models/subinventoryModel.js";
const { expect } = chai;
use(chaiHttp);
describe('Subinventory APIs', () => {

  describe('/GET subinventory', () => {
      it('it should GET all the subinventories', async () => {
            
    let response = await chai.request(app)
      .get("/api/subinventories");
    expect(response).to.have.status(200);
    expect(response.body).to.be.an("object");
    expect(response.body.subinventories).to.have.lengthOf(7);
      });
  });
  describe('/POST subinventory', () => {
    let tokens;
    
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
    let subinventory;
      it('it should POST a subinventory ', async () => {
          
            subinventory = new Subinventory({
              name: `${Date.now().toString()} ${Math.random()}`,
            });
           let response = await chai.request(app)
            .post('/api/subinventories')
            .send(subinventory).set('Authorization', 'JWT ' + tokens);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("msg").eql('Subinventory added successfully');
      });
  });
  
  describe('/GET/:id subinventory', () => {
    let tokens;
    
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
      it('it should GET a subinventory by the given id', () => {
          let subinventory = new Subinventory({ 
                      name: `${Date.now().toString()} ${Math.random()}`,
                    });
                    subinventory.save(async(err, subinventory) => {
          let response = await chai.request(app)
            .get('/api/subinventories/' + subinventory._id)
            .send(subinventory);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
          });

      });
  });
});
