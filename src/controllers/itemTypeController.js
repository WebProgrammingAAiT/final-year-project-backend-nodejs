import ItemTypeCollection from "../models/itemTypeModel.js";

const itemTypeCtrl = {
  addItemModel: async (req, res) => {
    const { name, itemCode } = req.body;
    if (!name && !itemCode) {
      return res.sendStatus(400);
    }

    try {
      await ItemTypeCollection.create({
        name, itemCode
      });

      return res.status(201).json({ msg: "itemType added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getItemModels: async (req, res) => {
    try {

      const itemTypes = await ItemTypeCollection.find();
      return res.status(200).json({ itemTypes });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getItemType: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const itemtype = await ItemTypeCollection.findById(id);
      if (!itemtype)
        return res.status(404).json({ msg: "No itemtype found." });

      return res.status(200).json({ itemtype });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // remember to change the updateDepartment to updateItemType
  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, itemCode } = req.body;
      if (!name || !id || !itemCode) { 
        return res.sendStatus(400);
      }

      const result = await ItemTypeCollection.findByIdAndUpdate(id, {
        name, itemCode
      });
      if (!result) {
        return res.status(404).json({ msg: "No ItemType found." });
      }
      return res.json({
        msg: "ItemType updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteItemType: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const result = await ItemTypeCollection.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ msg: "No itemtype found." });
      }
      return res.json({
        msg: "Itemtype deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default itemTypeCtrl;
