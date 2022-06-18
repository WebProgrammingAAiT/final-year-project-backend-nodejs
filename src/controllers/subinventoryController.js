import SubinventoryCollection from "../models/subinventoryModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";

const subinventoryCtrl = {
  addSubinventory: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.sendStatus(400);
      }
      let subinventory = await SubinventoryCollection.findOne({
        name,
      });
      if (subinventory)
        return res
          .status(400)
          .json({ msg: "Subinventory with the specified name already exists. Please try again with a new name." });
      await SubinventoryCollection.create({
        name,
      });

      return res.status(201).json({ msg: "Subinventory added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSubinventories: async (req, res) => {
    try {
      const subinventories = await SubinventoryCollection.find();
      return res.status(200).json({ subinventories });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSubinventory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const subinventory = await SubinventoryCollection.findById(id);
      if (!subinventory) return res.status(404).json({ msg: "No subinventory found." });

      return res.status(200).json({ subinventory });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateSubinventory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name || !id) {
        return res.sendStatus(400);
      }

      const result = await SubinventoryCollection.findByIdAndUpdate(id, {
        name,
      });
      if (!result) {
        return res.status(404).json({ msg: "No subinventory found." });
      }
      return res.json({
        msg: "Subinventory updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteSubinventory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const subinventory = await SubinventoryCollection.findById(id);
      if (!subinventory) {
        return res.status(404).json({ msg: "No subinventory found." });
      }
      const itemBelongingToSubinventory = await SubinventoryItemCollection.findOne({ subinventory: id });
      if (itemBelongingToSubinventory) return res.status(400).json({ msg: "Subinventory is currently being used by an item." });

      await SubinventoryCollection.findByIdAndDelete(id);

      return res.json({
        msg: "Subinventory deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default subinventoryCtrl;
