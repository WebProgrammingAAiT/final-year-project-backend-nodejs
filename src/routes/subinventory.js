import express from 'express';
import subInventoryCtrl from '../controllers/subinventoryController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/subinventories',hasValidToken,isAdmin, subInventoryCtrl.addSubInventory);
router.get('/subinventories',subInventoryCtrl.getSubInventories);
router.get('/subinventories/:id',subInventoryCtrl.getSubInventory);
router.put('/subinventories/:id',hasValidToken,isAdmin,subInventoryCtrl.updateSubInventory);
router.delete('/subinventories/:id',hasValidToken,isAdmin,subInventoryCtrl.deleteSubInventory);



export default router;