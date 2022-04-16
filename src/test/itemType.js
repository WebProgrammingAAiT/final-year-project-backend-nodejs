process.env.NODE_ENV = "test";

import chai, { use} from "chai";
import chaiHttp from "chai-http";
import app from "../index.js";
import Item_Type from "../models/itemTypeModel.js";
const { expect } = chai;
use(chaiHttp);
describe('Item type APIs', () => {
  describe('/GET item type', () => {
      it('it should GET all the item types', async () => {
            
    let response = await chai.request(app)
      .get("/api/itemTypes");
    expect(response).to.have.status(200);
    expect(response.body).to.be.an("object");
    expect(response.body.itemTypes).to.have.lengthOf(2);
      });
  });
  describe('/POST item type', () => {
    let itemType1;
      it('it should POST a item type ', async () => {
          
            itemType1 = new Item_Type({
              name: `${Date.now().toString()} ${Math.random()}`,
              itemCode: `${Date.now().toString()} ${Math.random()}`,
            });
           let response = await chai.request(app)
            .post('/api/itemTypes')
            .send(itemType1).set('Authorization', 'JWT ' + process.env.ADMIN_TOKEN);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("msg").eql('ItemType added successfully');
      });
  });
  describe('/GET/:id item type', () => {
      it('it should GET a item type by the given id', () => {
          let itemType = new Item_Type({ 
                      name: `${Date.now().toString()} ${Math.random()}`,
                      itemCode: `${Date.now().toString()} ${Math.random()}`,
                    });
                    itemType.save(async(err, itemType) => {
          let response = await chai.request(app)
            .get('/api/itemTypes/' + itemType._id)
            .send(itemType);
            
    expect(response).to.have.status(201);
    expect(response.body).to.be.an("object");
          });

      });
  });
  describe('/PUT/:id item type', async() => {
      it('it should UPDATE a item type given the id', async() => {
        let itemType = new Item_Type({ 
          name: `random`,
          itemCode: "0003",
        });
        await itemType.save(async(err, itemType) => {
        let res = await chai.request(app).put('/api/itemTypes/' + itemType._id).send({name:'updated table', itemCode: itemType.itemCode}).set('Authorization', 'JWT ' + process.env.ADMIN_TOKEN);
            
        console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("msg").eql('ItemType updated successfully');
        
        });
        
      });
  });
  
});
