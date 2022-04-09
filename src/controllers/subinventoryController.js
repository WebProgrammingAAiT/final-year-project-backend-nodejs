import SubInventoryCollection from "../models/subinventoryModel.js";

const subInventoryCtrl = {
  addSubInventory: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.sendStatus(400);
    }

    try {
      await SubInventoryCollection.create({
        name,
      });

      return res.status(201).json({ msg: "SubInventory added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSubInventories: async (req, res) => {
    try {
      
      const subinventories = await SubInventoryCollection.find();
      return res.status(200).json({ subinventories });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSubInventory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const subinventory = await SubInventoryCollection.findById(id);
      if (!subinventory)
        return res.status(404).json({ msg: "No subinventory found." });

      return res.status(200).json({ subinventory });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateSubInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name || !id) {
        return res.sendStatus(400);
      }

      const result = await SubInventoryCollection.findByIdAndUpdate(id, {
        name,
      });
      if (!result) {
        return res.status(404).json({ msg: "No subinventory found." });
      }
      return res.json({
        msg: "subinventory updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteSubInventory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const result = await SubInventoryCollection.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ msg: "No subinventory found." });
      }
      return res.json({
        msg: "subinventory deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default subInventoryCtrl;
