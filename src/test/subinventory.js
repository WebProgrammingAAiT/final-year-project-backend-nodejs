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
  describe('/PUT/:id subinventory', async() => {
      it('it should UPDATE a subinventory given the id', async() => {
        let subinventory = new Subinventory({ 
          name: `random`,
        });
        await subinventory.save(async(err, subinventory) => {
        let res = await chai.request(app).put('/api/subinventories/' + subinventory._id).send({name:'updated subinventory'}).set('Authorization', 'JWT ' + tokens);
      
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("msg").eql('Subinventory updated successfully');
        
        });
        
      });
  });
  describe('/DELETE/:id subinventory', () => {
    let tokens;
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
      it('it should DELETE a subinventory given the id', () => {
        let subinventory = new Subinventory({ 
          name: `random`,
        });
        subinventory.save(async(err, subinventory) => {
        let res = await chai.request(app).delete('/api/subinventories/' + subinventory._id)
        .set('Authorization', 'JWT ' + tokens);
      
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("msg").eql('Subinventory deleted successfully');
        
        });
        
      });
  });
});
