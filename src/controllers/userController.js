import UserCollection from "../models/userModel.js";

const userCtrl = {
    changeDepartment: async(req, res) => {
        const { emailOrUsername, departmentId } = req.body;
        if (!emailOrUsername || !departmentId) return res.sendStatus(400);
        const user = await UserCollection.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });

        if(!user) return res.status(404).json({ msg: "No user found." });

        if(user.role !== "departmentUser") return res.status(400).json({ msg: "User is not a department user." });

        user.department = departmentId;
        await user.save();
        return res.status(200).json({ msg: "Department changed successfully" });

    }

};
export default userCtrl;