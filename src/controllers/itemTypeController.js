import ItemTypeCollection from "../models/itemTypeModel.js";
import ItemCollection from "../models/itemModel.js";

const itemTypeCtrl = {
  addItemType: async (req, res) => {
    try {
      const { name, itemCode } = req.body;
      if (!name && !itemCode) {
        return res.sendStatus(400);
      }
      if (itemCode.length < 4) {
        return res.status(400).json({ msg: "Item Code must be at least 4 characters long" });
      }
      let itemType = await ItemTypeCollection.findOne({
        name,
      });
      if (itemType)
        return res
          .status(400)
          .json({ msg: "Item Type with the specified name already exists. Please try again with a new name." });
      itemType = await ItemTypeCollection.findOne({
        itemCode,
      });
      if (itemType)
        return res
          .status(400)
          .json({ msg: "Item Type with the specified code already exists. Please try again with a new code." });
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
  searchForItemCode: async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm;
      let filter = {};
      // the i is for case insensitive search
      if (searchTerm) {
        filter = {
          name: { $regex: searchTerm, $options: "i" },
        };
      }
      let itemTypes = await ItemTypeCollection.find(filter);

      return res.status(200).json({ itemTypes });
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
      if (itemCode.length < 4) {
        return res.status(400).json({ msg: "Item Code must be at least 4 characters long" });
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
      const itemType = await ItemTypeCollection.findById(id);
      if (!itemType) {
        return res.status(404).json({ msg: "No ItemType found." });
      }
      const itemBelongingToItemType = await ItemCollection.findOne({ itemType: id });
      if (itemBelongingToItemType) return res.status(400).json({ msg: "Item Type is currently being used by an item." });

      await ItemTypeCollection.findByIdAndDelete(id);
      return res.json({
        msg: "ItemType deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default itemTypeCtrl;
