# TrackWise 💸

A modern expense tracking application built with Next.js that helps users monitor spending, manage budgets, and gain actionable insights into their financial habits.

## Overview

TrackWise provides a simple and intuitive way to track daily expenses while offering powerful analytics through interactive dashboards. Users can securely sign in with Google, manage expenses, and visualize spending patterns across different categories.

Built as the first project in my **30 Projects in 30 Weeks** challenge, TrackWise focuses on real-world full-stack development practices including authentication, database management, API design, and data visualization.

## Features

* 🔐 Google OAuth Authentication
* 💰 Add, edit, and delete expenses
* 📊 Category-wise spending analysis
* 📈 Weekly expense comparisons
* 🎯 Monthly budget tracking
* 📱 Responsive user interface
* 🗄️ SQL-backed persistent storage
* ⚡ Fast and modern Next.js architecture

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* CSS

### Backend

* Next.js API Routes
* NextAuth.js

### Database

* SQL

### Authentication

* Google OAuth 2.0

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/trackwise.git
cd trackwise
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root.

```env
DATABASE_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Project Structure

```text
app/
├── api/
├── dashboard/
└── page.tsx

components/
├── Dashboard/
├── Hero/
└── UI/

lib/
├── db.ts
├── auth.ts
└── utils.ts

schema/

public/
```

## Key Learnings

During the development of TrackWise, I gained hands-on experience with:

* OAuth authentication flows
* Session management with NextAuth
* SQL database integration
* RESTful API development
* Full-stack architecture using Next.js
* Data visualization and dashboard design
* Type-safe development with TypeScript


## Contributing

Contributions, issues, and feature requests are welcome. Feel free to fork the repository and submit a pull request.


---

If you found this project helpful, consider giving it a ⭐ on GitHub.

