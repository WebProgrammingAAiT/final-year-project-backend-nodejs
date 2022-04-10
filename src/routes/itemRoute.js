import express from 'express';
import itemCtrl from '../controllers/itemController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/items/subinventory/nonPO',hasValidToken,isAdmin,itemCtrl.addItemToSubinventoryNonPO)  
router.get('/items/subinventory',itemCtrl.getSubinventoryItems);
router.post('/items/department',itemCtrl.addItemToDepartment);
router.get('/items/department',itemCtrl.getDepartmentItems);
router.get('/items/:id',itemCtrl.getItem);
router.put('/items/:id',hasValidToken,isAdmin,itemCtrl.updateItem);
router.delete('/items/:id',hasValidToken,isAdmin,itemCtrl.deleteItem);



export default router;