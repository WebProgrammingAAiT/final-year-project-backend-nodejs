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
});
