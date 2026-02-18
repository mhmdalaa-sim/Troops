# Martial Arts Gym Management App 🥋

A full-featured React web application for managing a martial arts gym, built with React Hooks and modern best practices.

## Features

### 👥 Customer Management
- Register new customers with membership details
- View customer profiles with attendance history
- Clock in customers and track sessions
- Freeze/unfreeze memberships with date ranges
- Search and filter customers by status
- Track low-session customers

### 🥋 Class Management
- Create and manage martial arts classes
- Set instructor, schedule, and capacity
- Track enrollment and class popularity
- Edit and delete classes
- Visual capacity indicators

### ✓ Attendance Tracking
- Quick customer check-in interface
- Real-time today's attendance view
- Class-specific or general check-ins
- Automatic session decrementing
- Search customers for fast check-in

### 📊 Dashboard (Owner View)
- Total and monthly income tracking
- Active/Frozen/Expired membership counts
- Class popularity analytics
- Revenue trend charts (6 months)
- Average sessions per customer
- Low session alerts

### 🔐 User Roles
- **Receptionist**: Customer management, check-ins, memberships
- **Business Owner**: Full dashboard access, analytics, class management
- Easy role switching

## Tech Stack

- **React 18** with Hooks (useState, useEffect, useContext, useReducer, useMemo, useCallback)
- **React Router v6** for navigation
- **Vite** for fast development and building
- **Context API** for state management
- **LocalStorage** for data persistence
- **Custom Hooks** for reusable logic

## Custom Hooks

- `useClockIn` - Attendance tracking logic
- `useFreezeMembership` - Membership freeze/unfreeze
- `useStats` - Dashboard calculations and analytics

## Project Structure

```
src/
├── components/
│   ├── Customer/
│   │   ├── CustomerCard.jsx
│   │   ├── CustomerDetail.jsx
│   │   └── CustomerForm.jsx
│   ├── Class/
│   │   ├── ClassList.jsx
│   │   ├── ClassForm.jsx
│   │   └── AttendanceTracker.jsx
│   ├── Dashboard/
│   │   └── StatsPanel.jsx
│   ├── Shared/
│   │   ├── SearchBar.jsx
│   │   └── FilterPanel.jsx
│   └── Layout/
│       └── Navbar.jsx
├── hooks/
│   ├── useClockIn.js
│   ├── useFreezeMembership.js
│   └── useStats.js
├── context/
│   ├── AuthContext.jsx
│   └── DataContext.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CustomersPage.jsx
│   ├── ClassesPage.jsx
│   └── AttendancePage.jsx
├── utils/
│   └── formatDate.js
├── App.jsx
└── main.jsx
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd d:\MyWork\Troops
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Login**: Choose your role (Receptionist or Business Owner) and enter your name
2. **Dashboard**: View overall statistics and analytics (Owner view)
3. **Customers**: Register, search, filter, and manage customer memberships
4. **Classes**: Create and manage martial arts classes
5. **Attendance**: Quick check-in interface for clocking in customers
6. **Role Switching**: Use the navbar button to switch between roles

## Design

- **Color Palette**: Dark reds (#8B0000), blacks (#1a1a1a), steel gray (#4A5568)
- **Typography**: Montserrat for headings, Roboto for body
- **Style**: Modern martial arts/gym aesthetic with bold accents
- **Responsive**: Mobile-friendly design

## Mock Data

The app comes pre-loaded with:
- 2 sample customers
- 3 martial arts classes (BJJ, Muay Thai, Kids Karate)
- Data persists in localStorage

## Future Enhancements

- PDF/CSV export for monthly reports
- Email notifications for low sessions
- Advanced analytics and charts
- Multi-gym support
- Payment processing integration
- Mobile app version

## License

MIT

## Author

Built with ❤️ for martial arts gym management
