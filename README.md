# 📋 TodoMaster - Full-Stack Todo List Application

A modern, full-stack todo list application built with **Next.js**, **Supabase**, and **Tailwind CSS**. Features real-time updates, secure authentication, and a beautiful responsive design.

![TodoMaster Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=TodoMaster+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **Complete CRUD Operations** - Create, Read, Update, Delete tasks
- **Real-time Updates** - Changes sync instantly across all connected clients
- **Task Management** - Set priorities, due dates, and status tracking
- **Advanced Filtering** - Filter by status, priority, and due date
- **Task Statistics** - Visual dashboard with completion metrics

### 🔐 Authentication & Security
- **Secure User Registration** - Email/password signup with validation
- **Protected Routes** - Authentication required for dashboard access
- **Password Management** - Change password functionality
- **Row Level Security** - Database-level security with Supabase RLS

### 🎨 User Experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Dark/Light Mode Ready** - Prepared for theme switching
- **Intuitive Interface** - Clean, user-friendly design

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - Latest React with hooks and concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful, customizable icons

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Built-in authentication system
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live data synchronization

### Development Tools
- **JavaScript (ES6+)** - Modern JavaScript features
- **Next.js API Routes** - Serverless API endpoints
- **Environment Variables** - Secure configuration management

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Supabase Account** - [Sign up here](https://supabase.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/todomaster.git
cd todomaster
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

#### Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com/)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

#### Get Your Project Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Set Up the Database

#### Run SQL Scripts in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following scripts in order:

**Script 1: Create Tables and Security**
```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Script 2: Enable Real-time**
```sql
-- Enable realtime for todos table
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- Grant necessary permissions for realtime
GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### Getting Started
1. **Visit the Landing Page** - Navigate to the homepage
2. **Create an Account** - Click "Sign Up" and register with email/password
3. **Access Dashboard** - You'll be automatically redirected to your dashboard

### Managing Tasks
1. **Create Tasks** - Click "Add Task" button
2. **Edit Tasks** - Click the menu (⋮) next to any task and select "Edit"
3. **Complete Tasks** - Check the checkbox next to a task
4. **Delete Tasks** - Use the menu (⋮) and select "Delete"
5. **Filter Tasks** - Use the filter dropdowns to view specific tasks

### Profile Management
1. **Access Profile** - Click your account menu and select "Profile"
2. **Change Password** - Use the password change form
3. **View Account Info** - See your email and registration date

## 🏗️ Project Structure

```
todomaster/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.jsx        # Login page
│   │   └── signup/page.jsx       # Signup page
│   ├── dashboard/page.jsx        # Main dashboard
│   ├── profile/page.jsx          # User profile page
│   ├── api/                      # API routes (fallback)
│   │   ├── auth/                 # Auth endpoints
│   │   │   ├── login/route.js    # Login API
│   │   │   ├── signup/route.js   # Signup API
│   │   │   └── change-password/route.js # Password change API
│   │   └── todos/                # Todo endpoints
│   │       ├── route.js          # Get/Create todos
│   │       └── [id]/route.js     # Update/Delete specific todo
│   ├── globals.css               # Global styles
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Landing page
├── components/                   # Reusable components
│   └── ui/                       # shadcn/ui components
│       ├── button.jsx            # Button component
│       ├── card.jsx              # Card component
│       ├── input.jsx             # Input component
│       ├── textarea.jsx          # Textarea component
│       └── ...                   # Other UI components
├── lib/                          # Utility libraries
│   ├── utils.js                  # Utility functions
│   └── supabase.js               # Supabase client and helpers
├── scripts/                      # Database scripts
│   ├── 001-create-tables.sql     # Database schema
│   ├── 002-enable-realtime.sql   # Real-time setup
│   └── 003-seed-data.sql         # Sample data (optional)
├── .env.local                    # Environment variables
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── README.md                     # This file
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |

### Supabase Configuration
1. **Authentication Settings**
   - Go to **Authentication** → **Settings**
   - Configure email templates (optional)
   - Set up redirect URLs for production

2. **Database Settings**
   - Ensure Row Level Security is enabled
   - Verify all policies are created correctly
   - Check that real-time is enabled for the `todos` table

3. **API Settings**
   - Note your project URL and keys
   - Configure CORS settings if needed

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update Supabase Settings**
   - Add your Vercel domain to Supabase Auth settings
   - Update redirect URLs if needed

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify** - Static site generation
- **Railway** - Full-stack deployment
- **Heroku** - Container deployment
- **DigitalOcean** - App Platform

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration works
- [ ] User login/logout works
- [ ] Creating tasks works
- [ ] Editing tasks works
- [ ] Deleting tasks works
- [ ] Task completion toggle works
- [ ] Filtering works
- [ ] Real-time updates work (test with multiple browser tabs)
- [ ] Password change works
- [ ] Responsive design works on mobile

### Test User Account
For quick testing, you can use the demo account:
- **Email:** demo@example.com
- **Password:** password123

## 🐛 Troubleshooting

### Common Issues

**1. Environment Variables Not Working**
- Ensure `.env.local` is in the root directory
- Restart the development server after adding variables
- Check that variables start with `NEXT_PUBLIC_`

**2. Supabase Connection Issues**
- Verify your Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure Row Level Security policies are set up

**3. Real-time Updates Not Working**
- Verify real-time is enabled for the `todos` table
- Check browser console for WebSocket errors
- Ensure you're authenticated when testing

**4. Authentication Issues**
- Check Supabase Auth settings
- Verify email confirmation settings
- Ensure redirect URLs are configured

### Getting Help
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Visit [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub
- Join the [Supabase Discord](https://discord.supabase.com/)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines
- Use meaningful commit messages
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Supabase Team** - For the excellent backend-as-a-service
- **shadcn** - For the beautiful UI components
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** for real-time help

---

**Built with ❤️ using Next.js and Supabase**

Happy coding! 🚀
```

Perfect! I've successfully converted all TypeScript files to JavaScript and created a comprehensive README.md with detailed setup instructions. Here's what I've accomplished:

## 🔄 **Conversion Summary:**

### **Files Converted to JavaScript:**
- ✅ All `.tsx` files → `.jsx` files
- ✅ All `.ts` files → `.js` files
- ✅ Removed TypeScript type annotations
- ✅ Simplified interfaces to regular objects
- ✅ Updated import/export statements

### **📚 Comprehensive README.md Created:**
- **Complete setup instructions** for frontend and backend
- **Supabase database configuration** with SQL scripts
- **Environment variable setup** guide
- **Deployment instructions** for Vercel and other platforms
- **Project structure** documentation
- **Troubleshooting guide** for common issues
- **Testing checklist** for manual verification
- **Contributing guidelines** for developers

## 🎯 **Key Features of the README:**

1. **Step-by-step setup** from clone to deployment
2. **Database schema creation** with copy-paste SQL scripts
3. **Environment configuration** with examples
4. **Real-time setup** instructions
5. **Deployment guides** for multiple platforms
6. **Troubleshooting section** for common issues
7. **Project structure** overview
8. **Testing guidelines** and checklists

The application is now fully converted to JavaScript and includes everything needed to get started, from development setup to production deployment! 🚀
