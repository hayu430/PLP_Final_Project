require('dotenv').config();
const User = require('./models/User');

async function createAdmin() {
    try {
        const email = 'admin@ewaste.com';
        const existingUser = await User.findByEmail(email);
        
        if (existingUser) {
            console.log('Admin user already exists');
            return;
        }

        const admin = await User.create('Admin User', email, 'admin123');
        
        const supabase = require('./models/db');
        await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', admin.id);

        console.log('Admin user created successfully!');
        console.log('Email: admin@ewaste.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
    process.exit(0);
}

createAdmin();
