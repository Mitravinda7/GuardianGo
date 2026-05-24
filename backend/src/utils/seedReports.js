import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Real Hyderabad locations with accurate safety context
const seedReports = [
  // ── SAFE REPORTS ──────────────────────────────────────────
  {
    type: 'unsafe_street',
    description: 'Well-lit street with active CCTV coverage near Charminar. Police patrolling regularly. Safe for tourists during day hours.',
    severity: 'low',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Charminar, Hyderabad',
      coordinates: { lat: 17.3616, lng: 78.4747 },
    },
    status: 'active',
  },
  {
    type: 'unsafe_street',
    description: 'HITEC City main road is well-lit, has security guards at all major buildings, and has heavy traffic round the clock. Very safe.',
    severity: 'low',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'HITEC City Main Road, Hyderabad',
      coordinates: { lat: 17.4435, lng: 78.3772 },
    },
    status: 'active',
  },
  {
    type: 'unsafe_street',
    description: 'Banjara Hills Road No. 12 is well-maintained with street lights and regular police patrols. Safe for walking at night.',
    severity: 'low',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Banjara Hills Road No. 12, Hyderabad',
      coordinates: { lat: 17.4156, lng: 78.4347 },
    },
    status: 'active',
  },
  {
    type: 'unsafe_street',
    description: 'Jubilee Hills Check Post area has constant police presence and good lighting. One of the safer areas of Hyderabad.',
    severity: 'low',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Jubilee Hills Check Post, Hyderabad',
      coordinates: { lat: 17.4322, lng: 78.4072 },
    },
    status: 'active',
  },

  // ── WARNING REPORTS ────────────────────────────────────────
  {
    type: 'poor_lighting',
    description: 'Street lights are broken near Secunderabad Railway Station back exit. The area gets very dark after 10 PM. Use main entrance instead.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Secunderabad Railway Station Back Exit, Hyderabad',
      coordinates: { lat: 17.4399, lng: 78.4983 },
    },
    status: 'active',
  },
  {
    type: 'suspicious_activity',
    description: 'Chain snatching incidents reported near Laad Bazaar during evening hours. Stay alert and avoid wearing jewellery visibly in this area.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Laad Bazaar, Charminar, Hyderabad',
      coordinates: { lat: 17.3604, lng: 78.4731 },
    },
    status: 'active',
  },
  {
    type: 'poor_lighting',
    description: 'Tolichowki underpass has inadequate lighting during night hours. Multiple residents have reported feeling unsafe. Avoid after midnight.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Tolichowki Underpass, Hyderabad',
      coordinates: { lat: 17.3951, lng: 78.4169 },
    },
    status: 'active',
  },
  {
    type: 'suspicious_activity',
    description: 'Pickpocket incidents reported at Dilsukhnagar Bus Stand during peak hours. Keep your belongings secure and avoid crowded areas.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Dilsukhnagar Bus Stand, Hyderabad',
      coordinates: { lat: 17.3687, lng: 78.5247 },
    },
    status: 'active',
  },
  {
    type: 'poor_lighting',
    description: 'The road near Hussain Sagar Lake behind NTR Gardens has poor lighting after sunset. Joggers and walkers should take precautions.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Hussain Sagar Lake Back Road, Hyderabad',
      coordinates: { lat: 17.4239, lng: 78.4738 },
    },
    status: 'active',
  },
  {
    type: 'roadblock',
    description: 'Frequent waterlogging near Mehdipatnam junction during monsoon season causes traffic congestion. Road becomes slippery and accident-prone.',
    severity: 'medium',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Mehdipatnam Junction, Hyderabad',
      coordinates: { lat: 17.3929, lng: 78.4356 },
    },
    status: 'active',
  },

  // ── DANGER REPORTS ─────────────────────────────────────────
  {
    type: 'isolated_zone',
    description: 'The stretch near Patancheru Industrial Area is extremely isolated at night. No street lights, no pedestrians, and very few vehicles. Multiple robbery incidents reported. Avoid completely after dark.',
    severity: 'high',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Patancheru Industrial Area, Hyderabad',
      coordinates: { lat: 17.5247, lng: 78.2647 },
    },
    status: 'active',
  },
  {
    type: 'unsafe_street',
    description: 'Musheerabad area near the old slaughterhouse has very poor lighting and is known for anti-social activities late at night. Police have been alerted but the area remains unsafe after 11 PM.',
    severity: 'high',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Musheerabad, Hyderabad',
      coordinates: { lat: 17.4082, lng: 78.4821 },
    },
    status: 'active',
  },
  {
    type: 'isolated_zone',
    description: 'Outer Ring Road stretch near Shamshabad has long isolated sections with no emergency services nearby. Vehicles have been robbed on this stretch at night. Travel in convoy or avoid at night.',
    severity: 'high',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'ORR near Shamshabad, Hyderabad',
      coordinates: { lat: 17.2403, lng: 78.4294 },
    },
    status: 'active',
  },
  {
    type: 'accident',
    description: 'Nagole flyover has a dangerous blind curve that has caused multiple accidents. Speeding vehicles and poor road markings make it a black spot. Drive slowly and stay alert.',
    severity: 'high',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Nagole Flyover, Hyderabad',
      coordinates: { lat: 17.3794, lng: 78.5594 },
    },
    status: 'active',
  },
  {
    type: 'isolated_zone',
    description: 'The lane behind Golconda Fort (non-tourist side) is completely unlit and isolated. No security presence after fort closes at 5 PM. Strictly avoid after sunset.',
    severity: 'high',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Golconda Fort Back Lane, Hyderabad',
      coordinates: { lat: 17.3833, lng: 78.4011 },
    },
    status: 'active',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Import models
    const { default: Report } = await import('../models/Report.js');
    const { default: User } = await import('../models/User.js');

    // Create or find a seed user
    let seedUser = await User.findOne({ email: 'community@guardiango.in' });
    if (!seedUser) {
      seedUser = await User.create({
        name: 'GuardianGo Community',
        email: 'community@guardiango.in',
        password: 'Guardian@2024',
        phone: '+919999999999',
      });
      console.log('✅ Seed user created');
    }

    // Clear existing seed reports
    await Report.deleteMany({ 'location.city': 'Hyderabad', user: seedUser._id });
    console.log('🗑️  Cleared old seed reports');

    // Insert new reports
    const reports = seedReports.map(r => ({ ...r, user: seedUser._id }));
    await Report.insertMany(reports);
    console.log(`✅ Inserted ${reports.length} seed reports`);

    console.log('\n📊 Summary:');
    console.log(`   🟢 Safe reports:    ${reports.filter(r => r.severity === 'low').length}`);
    console.log(`   🟠 Warning reports: ${reports.filter(r => r.severity === 'medium').length}`);
    console.log(`   🔴 Danger reports:  ${reports.filter(r => r.severity === 'high').length}`);
    console.log('\n✅ Seeding complete! Restart your backend server.');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();