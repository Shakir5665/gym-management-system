import QRCode from "qrcode";
import Member from "../models/Member.js";

export const createMember = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Check if member already exists
    const existingMember = await Member.findOne({ phone });
    if (existingMember) {
      return res.status(400).json({ message: "Member already exists with this phone number" });
    }
    
    // Create member
    const member = await Member.create({ name, phone });
    
    // Generate QR code
    const qrData = JSON.stringify({
      memberId: member._id.toString(),
      name: member.name,
      phone: member.phone,
      type: "gym_checkin"
    });
    
    const qr = await QRCode.toDataURL(qrData);
    
    // Save QR code
    member.qrCode = qr;
    await member.save();
    
    res.status(201).json(member);
  } catch (err) {
    console.error("Create member error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ message: err.message });
  }
};