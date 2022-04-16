process.env.NODE_ENV = "test";

import chai, { use} from "chai";
import chaiHttp from "chai-http";
import app from "../index.js";
import Department from "../models/departmentModel.js";
const { expect } = chai;
use(chaiHttp);
describe('Department APIs', () => {

  describe('/GET department', () => {
      it('it should GET all the departments', async () => {
            
    let response = await chai.request(app)
      .get("/api/departments");
    expect(response).to.have.status(200);
    expect(response.body).to.be.an("object");
    expect(response.body.departments).to.have.lengthOf(2);
      });
  });
  describe('/POST department', () => {
    let tokens;
    
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
    let department;
      it('it should POST a department ', async () => {
          
            department = new Department({
              name: `${Date.now().toString()} ${Math.random()}`,
            });
           let response = await chai.request(app)
            .post('/api/departments')
            .send(department).set('Authorization', 'JWT ' + tokens);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("msg").eql('Department added successfully');
      });
  });
  
  describe('/GET/:id department', () => {
    let tokens;
    
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
      it('it should GET a department by the given id', () => {
          let department = new Department({ 
                      name: `${Date.now().toString()} ${Math.random()}`,
                    });
                    department.save(async(err, department) => {
          let response = await chai.request(app)
            .get('/api/departments/' + department._id)
            .send(department);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
          });

      });
  });
  describe('/PUT/:id department', async() => {
      it('it should UPDATE a department given the id', async() => {
        let department = new Department({ 
          name: `random`,
        });
        await department.save(async(err, department) => {
        let res = await chai.request(app).put('/api/departments/' + department._id).send({name:'updated department'}).set('Authorization', 'JWT ' + tokens);
            
        console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("msg").eql('Department updated successfully');
        
        });
        
      });
  });
  describe('/DELETE/:id department', () => {
    let tokens;
    before(async()=>{
        let response = await chai.request(app).post("/api/login").send(
            {
                "emailOrUsername": "admin",
                "password": "itsc2022"
            });
        tokens = (response.body.accessToken);
    });
      it('it should DELETE a department given the id', () => {
        let department = new Department({ 
          name: `random`,
        });
        department.save(async(err, department) => {
        let res = await chai.request(app).delete('/api/departments/' + department._id)
        .set('Authorization', 'JWT ' + tokens);
      
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("msg").eql('Department deleted successfully');
        
        });
        
      });
  });
});
