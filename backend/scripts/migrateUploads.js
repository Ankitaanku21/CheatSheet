const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env BEFORE anything that needs it
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Resource = require('../models/Resource');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const resources = await Resource.find({ fileUrl: /^\/uploads\// });
  console.log(`Found ${resources.length} resources to migrate\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const resource of resources) {
    const relativePath = resource.fileUrl.replace('/uploads/', '');
    const localPath = path.join(uploadsDir, relativePath);

    if (!fs.existsSync(localPath)) {
      console.log(`[SKIP] File not found: ${resource.fileUrl} (${resource._id})`);
      skipped++;
      continue;
    }

    if (isDryRun) {
      console.log(`[DRY] ${resource.title} (${resource.fileUrl}) → would upload to Cloudinary`);
      success++;
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'cheatsheet/resources',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      });

      resource.fileUrl = result.secure_url;
      await resource.save();

      console.log(`[OK] ${resource.title} → ${result.secure_url}`);
      success++;
    } catch (err) {
      console.error(`[FAIL] ${resource.title} (${resource._id}): ${err.message || JSON.stringify(err)}`);
      failed++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total:    ${resources.length}`);
  console.log(`Success:  ${success}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Skipped:  ${skipped}`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Migration error:', err.message || err);
  process.exit(1);
});
