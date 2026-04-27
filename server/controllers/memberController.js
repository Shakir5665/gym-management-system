import Member from "../models/Member.js";
import QRCode from "qrcode";

function normalizeMemberPayload(payload = {}) {
  const fullLegalName = String(payload.fullLegalName ?? payload.name ?? "").trim();
  const primaryPhone = String(payload.phone ?? "").trim();
  const emergencyPhone = String(payload.emergencyPhone ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const homeAddress = String(payload.homeAddress ?? "").trim();
  const gender = String(payload.gender ?? "").trim().toUpperCase();
  const dobRaw = String(payload.dateOfBirth ?? "").trim();
  const dateOfBirth = dobRaw ? new Date(dobRaw) : null;

  return {
    name: fullLegalName,
    fullLegalName,
    phone: primaryPhone,
    emergencyPhone,
    email,
    homeAddress,
    gender: gender || undefined,
    dateOfBirth:
      dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth : undefined,
  };
}

export const createMember = async (req, res) => {
  try {
    const data = normalizeMemberPayload(req.body);
    const { fullLegalName, phone } = data;

    if (!fullLegalName || !phone) {
      return res.status(400).json({ message: "Full legal name and primary phone are required" });
    }

    // ❌ CHECK IF USER HAS GYM
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const member = await Member.create({
      ...data,
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

    const q = String(req.query.query || "").trim();
    const hasLimit = req.query.limit !== undefined && req.query.limit !== null && req.query.limit !== "";
    const parsedLimit = Number(req.query.limit);
    const limit = hasLimit && Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(parsedLimit, 50))
      : 0;

    const filter = { gymId: req.user.gymId };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { fullLegalName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { emergencyPhone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    let query = Member.find(filter);
    if (limit) query = query.limit(limit);
    const data = await query;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const existing = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!existing) return res.status(404).json({ message: "Member not found" });

    const data = normalizeMemberPayload(req.body);
    if (!data.fullLegalName || !data.phone) {
      return res.status(400).json({ message: "Full legal name and primary phone are required" });
    }

    existing.name = data.name;
    existing.fullLegalName = data.fullLegalName;
    existing.phone = data.phone;
    existing.emergencyPhone = data.emergencyPhone;
    existing.email = data.email;
    existing.homeAddress = data.homeAddress;
    existing.gender = data.gender;
    existing.dateOfBirth = data.dateOfBirth || null;

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};