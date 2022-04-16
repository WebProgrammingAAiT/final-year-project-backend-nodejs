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
});
