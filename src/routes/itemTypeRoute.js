import express from 'express';
import itemTypeCtrl from '../controllers/itemTypeController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/itemtypes',hasValidToken,isAdmin,itemTypeCtrl.addItemModel)  
router.get('/itemtypes',itemTypeCtrl.getItemModels);
router.get('/itemtypes/:id',itemTypeCtrl.getItemType);
router.put('/itemtypes/:id',hasValidToken,isAdmin,itemTypeCtrl.updateDepartment);
router.delete('/itemtypes/:id',hasValidToken,isAdmin,itemTypeCtrl.deleteItemType);



export default router;