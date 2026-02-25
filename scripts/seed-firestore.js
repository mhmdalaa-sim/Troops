// scripts/seed-firestore.js
// Seeding script that supports:
// - Emulator mode (VITE_FIREBASE_EMULATOR === 'true'): seeds Firestore documents + Auth users
// - Direct mode (VITE_FIREBASE_EMULATOR !== 'true'): seeds Firestore documents only (no Auth users)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
  VITE_FIREBASE_EMULATOR,
} = process.env;

if (!VITE_FIREBASE_PROJECT_ID) {
  console.error('VITE_FIREBASE_PROJECT_ID is required for seeding.');
  process.exit(1);
}

const useEmulator = VITE_FIREBASE_EMULATOR === 'true';

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

console.log(
  `Seeding Firestore for project "${VITE_FIREBASE_PROJECT_ID}" in ` +
    (useEmulator ? 'EMULATOR' : 'DIRECT/REMOTE') +
    ' mode.'
);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Gym-specific seed data based on this system's initial state
const seedClasses = [
  {
    id: 1,
    name: 'Brazilian Jiu-Jitsu',
    instructor: 'Master Carlos',
    schedule: 'Mon, Wed, Fri - 6:00 PM',
    capacity: 20,
    enrolledCount: 15,
    description: 'Ground fighting and grappling techniques',
    sessionsPerVisit: 1,
    monthlyFee: 120,
    dropInFee: 25,
  },
  {
    id: 2,
    name: 'Muay Thai',
    instructor: 'Kru Somchai',
    schedule: 'Tue, Thu - 7:00 PM',
    capacity: 15,
    enrolledCount: 12,
    description: 'The art of eight limbs - striking martial art',
    sessionsPerVisit: 1,
    monthlyFee: 100,
    dropInFee: 20,
  },
  {
    id: 3,
    name: 'Kids Karate',
    instructor: 'Sensei Mike',
    schedule: 'Sat - 10:00 AM',
    capacity: 25,
    enrolledCount: 18,
    description: 'Traditional karate for children ages 6-12',
    sessionsPerVisit: 1,
    monthlyFee: 80,
    dropInFee: 15,
  },
];

const seedCustomers = [
  {
    id: 1,
    name: 'John Smith',
    phone: '555-0101',
    photoUrl: '',
    email: 'john@example.com',
    membershipType: 'Monthly Premium',
    subscriptionFee: 150,
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    remainingSessions: 12,
    status: 'active',
    enrolledClasses: [1, 2],
    classSessions: {
      1: 12,
      2: 8,
    },
    attendanceLog: [],
    freezePeriods: [],
    dropInSessions: 0,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    phone: '555-0102',
    photoUrl: '',
    email: 'sarah@example.com',
    membershipType: '3-Month Basic',
    subscriptionFee: 300,
    startDate: '2024-11-01',
    endDate: '2025-02-01',
    remainingSessions: 24,
    status: 'active',
    enrolledClasses: [1],
    classSessions: {
      1: 24,
    },
    attendanceLog: [],
    freezePeriods: [],
    dropInSessions: 0,
  },
];

// Staff accounts used by reception and owner logins
// These map directly to the roles in AuthContext (receptionist / owner)
const seedStaff = [
  {
    id: 'owner-1',
    name: 'Gym Owner',
    email: 'admin@example.com',
    role: 'owner',
    active: true,
  },
  {
    id: 'receptionist-1',
    name: 'Front Desk',
    email: 'receptionist@example.com',
    role: 'receptionist',
    active: true,
  },
];

async function seedFirestore() {
  console.log('Seeding Firestore collections...');

  const classesCol = collection(db, 'classes');
  const customersCol = collection(db, 'customers');
  const staffCol = collection(db, 'staff');

  for (const cls of seedClasses) {
    await setDoc(doc(classesCol, String(cls.id)), cls);
    console.log(`Seeded class ${cls.name}`);
  }

  for (const customer of seedCustomers) {
    await setDoc(doc(customersCol, String(customer.id)), customer);
    console.log(`Seeded customer ${customer.name}`);
  }

  for (const staff of seedStaff) {
    await setDoc(doc(staffCol, staff.id), staff);
    console.log(`Seeded staff member ${staff.name} (${staff.role})`);
  }
}

async function seedAuthUsers() {
  if (!useEmulator) {
    throw new Error(
      'Auth user seeding is only supported when VITE_FIREBASE_EMULATOR=true. ' +
        'Create users manually in Firebase Console or use scripts/seed-auth-users-admin.js.'
    );
  }

  console.log('Seeding Auth users in emulator for gym staff...');

  const usersToCreate = [
    {
      email: 'admin@example.com',
      password: 'Password123!',
      displayName: 'Gym Owner',
    },
    {
      email: 'receptionist@example.com',
      password: 'Password123!',
      displayName: 'Receptionist',
    },
  ];

  for (const user of usersToCreate) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await updateProfile(cred.user, { displayName: user.displayName });
      console.log(`Created auth user ${user.email}`);
    } catch (err) {
      console.error(`Error creating user ${user.email}:`, err.message);
    }
  }
}

async function main() {
  try {
    await seedFirestore();

    if (useEmulator) {
      await seedAuthUsers();
    } else {
      console.log(
        'Skipped Auth user creation (direct/remote mode). Use Firebase Console or scripts/seed-auth-users-admin.js.'
      );
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();

