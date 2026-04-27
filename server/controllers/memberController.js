import Member from "../models/Member.js";
import QRCode from "qrcode";

export const createMember = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // ❌ CHECK IF USER HAS GYM
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const member = await Member.create({
      name,
      phone,
      gymId: req.user.gymId
    });

    const qr = await QRCode.toDataURL(member._id.toString());
    member.qrCode = qr;
    await member.save();

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    // ❌ CHECK IF USER HAS GYM
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const data = await Member.find({ gymId: req.user.gymId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};