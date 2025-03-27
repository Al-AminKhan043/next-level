// import fs from 'node:fs';

// import sql from 'better-sqlite3';
// import slugify from 'slugify';
// import xss from 'xss';

// const db = sql('meals.db');

// export async function getMeals() {
//   // await new Promise((resolve) => setTimeout(resolve, 5000));

//   // throw new Error('Loading meals failed');
//   return db.prepare('SELECT * FROM meals').all();
// }

// export function getMeal(slug) {
//   return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
// }

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split('.').pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new Error('Saving image failed!');
//     }
//   });

//   meal.image = `/images/${fileName}`;

//   db.prepare(`
//     INSERT INTO meals
//       (title, summary, instructions, creator, creator_email, image, slug)
//     VALUES (
//       @title,
//       @summary,
//       @instructions,
//       @creator,
//       @creator_email,
//       @image,
//       @slug
//     )
//   `).run(meal);
// }


import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';
import cloudinary from '@/lib/cloudinary';

const db = sql('meals.db');

export async function getMeals() {
  return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const bufferedImage = await meal.image.arrayBuffer();

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'NextLevel', // Uploading to "NextLevel" folder
          public_id: meal.slug, // Using slug as filename in Cloudinary
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload failed: ' + error.message));
          } else {
            resolve(result);
          }
        }
      ).end(Buffer.from(bufferedImage));
    });

    meal.image = result.secure_url; // Store Cloudinary URL in DB

    db.prepare(`
      INSERT INTO meals
        (title, summary, instructions, creator, creator_email, image, slug)
      VALUES (
        @title,
        @summary,
        @instructions,
        @creator,
        @creator_email,
        @image,
        @slug
      )
    `).run(meal);

  } catch (error) {
    throw new Error('Saving meal failed: ' + error.message);
  }
}
