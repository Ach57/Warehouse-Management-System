const mongoose = require('mongoose');
const User = require('./user');
require('dotenv').config();

async function updateUserRole(username, newRole) {
    try {
        // Assuming mongoose connection is already established in the main file
        console.log('Connected to MongoDB');

        //Find the user by username

        const user = await User.findOne({username: username});
        if(!user){
            console.log(`User ${username} not found`);
            return { success: false, message: `User ${username} not found` };
        }

        if(user.role === newRole){
            console.log(`User ${username} is already an ${newRole}`);
            return { success: false, message: `User ${username} is already an ${newRole}` };
        }
        

        const result = await User.findOneAndUpdate(
            { username: username },
            { role: newRole },
            { new: true }
        );

        if (result) {
            console.log(`User ${username} updated to role ${newRole}`);
            return { success: true, message: `User ${username} updated to role ${newRole}` };
        } else {
            console.log(`User ${username} not found`);
            return { success: false, message: `User ${username} not found during update` };
        }
    } catch (error) {
        console.error('Error updating user role: ', error);
        return { success: false, message: 'Error updating user role' };
    }
}

module.exports = { updateUserRole }; //exporting the file
 