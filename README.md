# 🪙 ScalePay

**ScalePay** is a premium, real-time personal wealth and expense tracker designed to help individuals take control of their finances with ease. Built with a modern, dark-themed user interface, it provides responsive budgeting controls, interactive data analytics, and secure cloud synchronization.

---

## ✨ Features

- **📊 Interactive Analytics**: Rich visual analytics featuring category distributions and spending trend charts built using `recharts`.
- **💰 Dynamic Budgeting**: Define customized spending limits per category with responsive progress bars and alerts when budgets are close to being exceeded.
- **🔄 Supabase Cloud Sync**: Real-time cloud database synchronization via Supabase backend authentication, alongside a fully-functional offline Demo Mode.
- **🔒 Secure Authentication**: Clean sign-in, sign-up, and forgot password forms equipped with interactive security helpers such as a password visibility toggle.
- **⚡ SEO Optimization**: Optimized meta configuration, dynamic sitemap creation, robot crawler rules (`robots.txt`), and automated Open Graph previews.
- **🎨 Premium Dark Theme**: A responsive design built with Tailwind CSS v4, custom CSS-variable palettes, and polished icons.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server-side & Client-side Rendering)
- **Database / Auth**: [Supabase](https://supabase.com/) (SSR integration & local storage fallback)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Next Themes](https://github.com/pacocoursey/next-themes)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **UI Components**: [Radix UI Primitives](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or newer)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/scale-pay.git
   cd scale-pay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Database Setup

To set up the database tables and authentication triggers, execute the schema located in [supabase-schema.sql](supabase-schema.sql) within your Supabase SQL Editor.
