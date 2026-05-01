import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import QRCode from 'qrcode';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

dotenv.config();

const migrate = async () => {
  try {
    console.log('🚀 Starting Cloudinary Migration...');
    const dbName = process.env.MONGO_DB_NAME || 'gymsystem';
    await mongoose.connect(process.env.MONGO_URI, { dbName });
    console.log(`✅ Connected to MongoDB (db: ${dbName})`);

    // --- 1. MIGRATE GYM LOGOS ---
    console.log('\n🏢 Migrating Gym Logos...');
    const gyms = await Gym.find({
      logo: { $regex: /^data:image/ }
    });
    console.log(`🔍 Found ${gyms.length} gyms with Base64 logos.`);

    for (let i = 0; i < gyms.length; i++) {
      const gym = gyms[i];
      console.log(`[${i + 1}/${gyms.length}] Migrating Logo for: ${gym.name}`);
      const logoUrl = await uploadToCloudinary(gym.logo, 'gym-system/branding');
      if (logoUrl) {
        gym.logo = logoUrl;
        await gym.save();
        console.log(`   ✅ Success`);
      }
    }

    // --- 2. MIGRATE MEMBERS ---
    console.log('\n👥 Migrating Member Data...');
    const members = await Member.find({
      $or: [
        { qrCode: { $regex: /^data:image/ } },
        { profilePicture: { $regex: /^data:image/ } },
        { qrCode: { $exists: false } },
        { qrCode: null }
      ]
    });

    console.log(`🔍 Found ${members.length} members to migrate.`);

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      console.log(`[${i + 1}/${members.length}] Migrating: ${member.name}`);

      let updated = false;

      // 1. Migrate QR Code
      if (!member.qrCode || member.qrCode.startsWith('data:image')) {
        const qrBase64 = member.qrCode || await QRCode.toDataURL(member._id.toString());
        const qrUrl = await uploadToCloudinary(qrBase64, 'gym-system/qr-codes');
        if (qrUrl) {
          member.qrCode = qrUrl;
          updated = true;
        }
      }

      // 2. Migrate Profile Picture
      if (member.profilePicture && member.profilePicture.startsWith('data:image')) {
        const imgUrl = await uploadToCloudinary(member.profilePicture, 'gym-system/profiles');
        if (imgUrl) {
          member.profilePicture = imgUrl;
          updated = true;
        }
      }

      if (updated) {
        await member.save();
        console.log(`   ✅ Success`);
      } else {
        console.log(`   ⏩ No change needed`);
      }
    }

    console.log('🎉 Migration Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Failed:', error);
    process.exit(1);
  }
};

migrate();
