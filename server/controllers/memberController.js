import Member from "../models/Member.js";
import QRCode from "qrcode";

export const createMember = async (req, res) => {
  const member = await Member.create(req.body);

  const qr = await QRCode.toDataURL(member._id.toString());
  member.qrCode = qr;
  await member.save();

  res.json(member);
};

export const getMembers = async (req, res) => {
  const data = await Member.find();
  res.json(data);
};