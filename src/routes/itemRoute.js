import express from 'express';
import itemCtrl from '../controllers/itemController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/items/subinventory/nonPO',hasValidToken,isAdmin,itemCtrl.addItemToSubinventoryNonPO)  
router.get('/items/subinventory',itemCtrl.getSubinventoryItems);
router.get('/items/subinventory/:id',itemCtrl.getSpecificSubinventoryItems);
router.get('/items/department',itemCtrl.getDepartmentItems);
router.get('/items/:id',itemCtrl.getItem);
router.put('/items/:id',hasValidToken,isAdmin,itemCtrl.updateItem);
router.delete('/items/:id',hasValidToken,isAdmin,itemCtrl.deleteItem);

//TODO: remove
router.put('/items/test/:id',itemCtrl.testItem);

export default router;