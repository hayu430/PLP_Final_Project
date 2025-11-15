# Quick Start Guide

## Getting Started

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000`

3. **Create an admin account (optional):**
   ```bash
   node create-admin.js
   ```
   - Admin Email: `admin@ewaste.com`
   - Admin Password: `admin123`

## User Journey

### For Regular Users:

1. **Register:**
   - Click "Get Started" or "Register" from the homepage
   - Fill in your name, email, and password
   - You'll be automatically logged in after registration

2. **Submit E-Waste:**
   - From your dashboard, click "Submit New E-Waste"
   - Fill in item details (name, category, condition, location)
   - Optionally upload a photo
   - Click "Submit Item"

3. **Track Your Items:**
   - View all your submissions on the dashboard
   - See status: Pending → Collected → Recycled
   - Delete items that are still "Pending"

4. **Earn Points:**
   - Receive 10 eco-points when an item is marked as "Recycled"
   - View your total points on the dashboard
   - Check your ranking on the leaderboard

5. **Find Recycling Centers:**
   - Click "Find Centers" in the navigation
   - Browse certified recycling centers
   - Contact centers directly

### For Administrators:

1. **Login:**
   - Use admin credentials to login
   - You'll be redirected to the admin dashboard

2. **View Analytics:**
   - See total items, active users, and recycled items
   - View charts showing status and category distribution

3. **Manage Items:**
   - View all submitted e-waste items from all users
   - Update item status (Pending → Collected → Recycled)
   - When marking items as "Recycled", users automatically earn points

4. **View Users:**
   - See all registered users and their eco-points

## Features Overview

### ✅ Implemented Features:

- ✅ User registration and login with secure password hashing
- ✅ E-waste submission with photo upload
- ✅ Item status tracking (Pending/Collected/Recycled)
- ✅ Eco-points reward system (10 points per recycled item)
- ✅ User dashboard with statistics
- ✅ Admin control panel with analytics
- ✅ Visual charts (Chart.js) showing recycling progress
- ✅ Leaderboard showing top contributors
- ✅ Recycling centers directory
- ✅ Responsive design for mobile and desktop
- ✅ Smooth animations and transitions
- ✅ CRUD operations for e-waste items
- ✅ File upload with validation
- ✅ Session-based authentication
- ✅ Row Level Security (RLS) in database

### 🎨 Design Highlights:

- Green color theme (#28a745) representing environmental sustainability
- Smooth hover animations and transitions
- Responsive layout using CSS Grid and Flexbox
- Font Awesome icons throughout
- Clean, modern interface
- Professional gradient effects

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Charts:** Chart.js
- **Authentication:** express-session, bcrypt
- **File Upload:** multer

## Default Sample Data

The database comes with 3 sample recycling centers:
1. GreenTech Recycling Hub - San Francisco, CA
2. E-Cycle Solutions - Portland, OR
3. TechWaste Recovery Center - Austin, TX

## Troubleshooting

**Can't login?**
- Make sure you've registered first
- Check that your credentials are correct

**Admin dashboard not accessible?**
- Use the admin account created with `node create-admin.js`
- Regular users cannot access the admin dashboard

**Image upload not working?**
- Only image files (JPEG, JPG, PNG, GIF) are allowed
- Maximum file size is 5MB

**Can't delete an item?**
- Only items with "Pending" status can be deleted
- Collected or Recycled items cannot be deleted

## Support

For issues or questions about the application, refer to the main README.md file.

---

**Enjoy using E-Waste Reclaimer and contribute to a sustainable future! 🌱♻️**
