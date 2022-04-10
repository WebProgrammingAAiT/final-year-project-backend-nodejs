import ItemTypeCollection from "../models/itemTypeModel.js";

const itemTypeCtrl = {
  addItemType: async (req, res) => {
    try {
      const { name, itemCode } = req.body;
      if (!name && !itemCode) {
        return res.sendStatus(400);
      }
      if(itemCode.length<4){
        return res.status(400).json({msg:'Item Code must be at least 4 characters long'});
      }

      await ItemTypeCollection.create({
        name,
        itemCode,
      });

      return res.status(201).json({ msg: "ItemType added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getItemTypes: async (req, res) => {
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
      const itemType = await ItemTypeCollection.findById(id);
      if (!itemType) return res.status(404).json({ msg: "No ItemType found." });

      return res.status(200).json({ itemType });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
 
  updateItemType: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, itemCode } = req.body;
      if (!name || !id || !itemCode) {
        return res.sendStatus(400);
      }
      if(itemCode.length<4){
        return res.status(400).json({msg:'Item Code must be at least 4 characters long'});
      }
      const result = await ItemTypeCollection.findByIdAndUpdate(id, {
        name,
        itemCode,
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
        return res.status(404).json({ msg: "No ItemType found." });
      }
      return res.json({
        msg: "ItemType deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default itemTypeCtrl;
