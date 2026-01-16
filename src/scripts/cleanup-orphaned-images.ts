import 'dotenv/config';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import db from '@/db';
import { images, spots, landmarks, user } from '@/db/schema';

/**
 * Script to clean up orphaned image files from /usercontent/images directory
 * that are not referenced in the database
 */
async function cleanupOrphanedImages() {
  console.log('🔍 Starting orphaned image cleanup...\n');

  try {
    // Get all referenced image URLs from database
    const referencedImages = new Set<string>();

    // 1. Get all images from images table
    console.log('📊 Fetching image references from database...');
    const dbImages = await db.select({ url: images.url }).from(images);
    dbImages.forEach((img) => {
      if (img.url && img.url.startsWith('/usercontent/images/')) {
        referencedImages.add(img.url);
      }
    });
    console.log(`   ✓ Found ${dbImages.length} images in images table`);

    // 2. Get all image URLs from spots table
    const dbSpots = await db.select({ image: spots.image }).from(spots);
    let spotImageCount = 0;
    dbSpots.forEach((spot) => {
      if (spot.image && spot.image.startsWith('/usercontent/images/')) {
        referencedImages.add(spot.image);
        spotImageCount++;
      }
    });
    console.log(`   ✓ Found ${spotImageCount} images in spots table`);

    // 3. Get all image URLs from landmarks table
    const dbLandmarks = await db.select({ image: landmarks.image }).from(landmarks);
    let landmarkImageCount = 0;
    dbLandmarks.forEach((landmark) => {
      if (landmark.image && landmark.image.startsWith('/usercontent/images/')) {
        referencedImages.add(landmark.image);
        landmarkImageCount++;
      }
    });
    console.log(`   ✓ Found ${landmarkImageCount} images in landmarks table`);

    // 4. Get all image URLs from user table (if any)
    const dbUsers = await db.select({ image: user.image }).from(user);
    let userImageCount = 0;
    dbUsers.forEach((usr) => {
      if (usr.image && usr.image.startsWith('/usercontent/images/')) {
        referencedImages.add(usr.image);
        userImageCount++;
      }
    });
    console.log(`   ✓ Found ${userImageCount} images in user table`);

    console.log(`\n📋 Total referenced images: ${referencedImages.size}`);

    // Get all files in the /usercontent/images directory
    const userContentDir = join(process.cwd(), 'usercontent', 'images');
    
    if (!existsSync(userContentDir)) {
      console.log('\n⚠️  Directory /usercontent/images does not exist. Nothing to clean.');
      return;
    }

    console.log(`\n📁 Scanning directory: ${userContentDir}`);
    const files = await readdir(userContentDir);
    console.log(`   ✓ Found ${files.length} files in directory`);

    // Filter out non-image files and check which are orphaned
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const orphanedFiles: string[] = [];
    const keptFiles: string[] = [];

    for (const file of files) {
      const filePath = join(userContentDir, file);
      const relativePath = `/usercontent/images/${file}`;
      
      // Skip non-image files
      const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
      if (!imageExtensions.includes(ext)) {
        console.log(`   ⏭️  Skipping non-image file: ${file}`);
        continue;
      }

      // Check if file is referenced in database
      if (referencedImages.has(relativePath)) {
        keptFiles.push(file);
      } else {
        orphanedFiles.push(file);
      }
    }

    console.log(`\n📊 Analysis complete:`);
    console.log(`   ✓ Files to keep: ${keptFiles.length}`);
    console.log(`   🗑️  Orphaned files to delete: ${orphanedFiles.length}`);

    if (orphanedFiles.length === 0) {
      console.log('\n✨ No orphaned images found. Database is clean!');
      return;
    }

    // Display orphaned files
    console.log('\n🗑️  Orphaned files to be deleted:');
    orphanedFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });

    // Delete orphaned files
    console.log('\n🗑️  Deleting orphaned files...');
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of orphanedFiles) {
      try {
        const filePath = join(userContentDir, file);
        await unlink(filePath);
        deletedCount++;
        console.log(`   ✓ Deleted: ${file}`);
      } catch (error) {
        errorCount++;
        console.error(`   ✗ Error deleting ${file}:`, error instanceof Error ? error.message : error);
      }
    }

    // Calculate space freed (optional - get file sizes)
    console.log('\n📊 Cleanup Summary:');
    console.log(`   ✓ Files deleted: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`   ✗ Errors: ${errorCount}`);
    }
    console.log(`   ✓ Files remaining: ${keptFiles.length}`);
    console.log('\n✨ Cleanup complete!');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrphanedImages()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

