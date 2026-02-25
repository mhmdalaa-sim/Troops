// scripts/seed-auth-users-admin.js
// Create Auth users directly in a Firebase project using the Admin SDK.
// Requires:
// - npm install firebase-admin
// - GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON for the target project.

import admin from 'firebase-admin';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'GOOGLE_APPLICATION_CREDENTIALS is not set. Point it to your service account JSON file.'
  );
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const auth = admin.auth();

// Define users to create (tailored to this gym system)
const usersToCreate = [
  {
    email: 'admin@example.com',
    password: 'Password123!',
    displayName: 'Admin User',
    disabled: false,
    customClaims: { role: 'owner' }, // maps to owner role in the app
  },
  {
    email: 'receptionist@example.com',
    password: 'Password123!',
    displayName: 'Receptionist User',
    disabled: false,
    customClaims: { role: 'receptionist' },
  },
];

async function main() {
  for (const user of usersToCreate) {
    try {
      const existing = await auth.getUserByEmail(user.email).catch(() => null);
      if (existing) {
        console.log(`User ${user.email} already exists, skipping.`);
        continue;
      }

      const { customClaims, ...createData } = user;
      const created = await auth.createUser(createData);
      console.log(`Created user ${user.email} with UID ${created.uid}`);

      if (customClaims) {
        await auth.setCustomUserClaims(created.uid, customClaims);
        console.log(`Set custom claims for ${user.email}`, customClaims);
      }
    } catch (err) {
      console.error(`Error creating user ${user.email}:`, err.message);
    }
  }

  console.log('Done seeding Auth users.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

