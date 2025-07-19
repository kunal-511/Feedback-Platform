# 📋 Feedback Platform

A modern, full-stack feedback collection platform that enables businesses to create custom feedback forms and collect responses from customers via shareable public URLs. Built with Next.js 14, TypeScript, and PostgreSQL.

## ✨ Features

### 🚀 Form Management
- **Dynamic Form Builder**: Create forms with multiple question types (text, textarea, multiple choice, rating)
- **Real-time Preview**: Instantly preview forms as you build them
- **Form Status Control**: Draft, Active, and Inactive states with easy publishing
- **Public URL Generation**: Auto-generated shareable links for published forms

### 📊 Response Analytics
- **Response Dashboard**: Comprehensive view of all form responses
- **Real-time Statistics**: Response rates, completion rates, and average ratings
- **Data Export**: CSV export functionality for deeper analysis
- **Response Filtering**: Filter and search through responses

### 🔐 Security & Authentication
- **User Authentication**: Secure login/registration with NextAuth.js
- **Resource Protection**: Users can only access their own forms
- **Rate Limiting**: Built-in spam protection and rate limiting
- **Data Validation**: Comprehensive input validation with Zod


## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Security**: bcryptjs password hashing, rate limiting


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kunal-511/feedback-platform.git
   cd feedback-platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```bash
   # Database
   DATABASE_URL=""
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Environment
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push database schema
   bun run db:push
   
   # Or run migrations (for production)
   bun run db:migrate
   ```

5. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.


## 📁 Project Structure

```
feedback-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication APIs
│   │   ├── forms/         # Form management APIs
│   │   └── public/        # Public form access APIs
│   ├── dashboard/         # Admin dashboard
│   │   └── forms/         # Form management pages
│   └── formview/          # Public form rendering
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── forms/             # Form-related components
│   ├── navigation/        # Navigation components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── prisma.ts         # Database client
│   ├── rate-limit.ts     # Rate limiting utilities
│   └── utils.ts          # General utilities
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Prisma schema definition
│   └── migrations/       # Database migrations
└── types/                # TypeScript type definitions
```

## 🏗️ Architecture

The platform follows a modern full-stack next js architecture with clear separation of concerns:

### System Design
- **Frontend**: React-based UI with server and client side rendering
- **Backend**: RESTful API built with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM for type-safe database access
- **Authentication**: JWT-based session management with NextAuth.js

### Data Flow
1. **User Authentication** → Secure login/registration flow
2. **Form Creation** → Interactive form builder with real-time preview
3. **Form Publishing** → Generate public URLs for form sharing
4. **Response Collection** → Capture and validate form submissions
5. **Analytics & Export** → Process and analyze response data

### Security Measures
- **Password Security**: bcrypt hashing with 12 rounds
- **Session Management**: JWT tokens with secure configuration
- **Input Validation**: Zod schema validation on all inputs
- **Rate Limiting**: IP-based submission limits
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 🎯 Core Features Deep Dive

### Form Builder
The interactive form builder supports:
- **Text Input**: Single-line text responses
- **Textarea**: Multi-line text responses  
- **Multiple Choice**: Radio button selections
- **Rating Scale**: 1-5 star ratings
- **Required Fields**: Mark questions as mandatory
- **Custom Options**: Define custom multiple choice options

### Response Analytics
Comprehensive analytics dashboard featuring:
- **Response Metrics**: Total responses, completion rates
- **Question Analytics**: Individual question performance
- **Time-based Insights**: Response patterns over time
- **Data Export**: CSV export for external analysis
