import express from 'express';
import subinventoryCtrl from '../controllers/subinventoryController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/subinventories',hasValidToken,isAdmin, subinventoryCtrl.addSubinventory);
router.get('/subinventories',subinventoryCtrl.getSubinventories);
router.get('/subinventories/:id',subinventoryCtrl.getSubinventory);
router.put('/subinventories/:id',hasValidToken,isAdmin,subinventoryCtrl.updateSubinventory);
router.delete('/subinventories/:id',hasValidToken,isAdmin,subinventoryCtrl.deleteSubinventory);



export default router;