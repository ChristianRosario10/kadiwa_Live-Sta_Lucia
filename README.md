# KAPISANAN LIVE System

A modern, responsive web application for managing Kadiwa member information, status, and tungkulin assignments.

## Features

### Dashboard
- Real-time display of member statistics
- Total Kadiwa Serial Numbers counter
- Count of members with Tungkulin
- Status-based member counts (Aktibo, Di Aktibo, UWP, MS, May Sakit)
- Recent members list with detailed information

### Member Registration
- Dynamic form for adding new members
- Automatic serial number generation
- Support for multiple tungkulin assignments
- Status selection (Aktibo, Di Aktibo, UWP, MS, May Sakit)
- Form validation and error handling

### Admin Panel
- Secure login system
- Full member management capabilities
- Edit member information
- Update member status
- Manage tungkulin assignments
- Delete member records
- Export member data
- Search functionality

### User Guide
- Comprehensive system documentation
- Clear instructions for all features
- System limitations and requirements
- Troubleshooting guide

## Technical Details

### Technologies Used
- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Local Storage for data persistence
- Font Awesome for icons

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Data Storage
The system uses the browser's Local Storage to persist data. This means:
- Data is stored locally in the user's browser
- Data persists between sessions
- No server-side storage required
- Regular data exports recommended for backup

### Security
- Admin panel protected by login
- Default admin credentials:
  - Username: admin
  - Password: admin123
- In a production environment, these should be changed and properly secured

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Navigate through the system using the navigation menu
4. For admin access, use the admin panel with the default credentials

## Usage

### Adding a New Member
1. Click "Register Member" in the navigation
2. Fill in the required information
3. Add tungkulin if needed (up to 5)
4. Select member status
5. Submit the form

### Managing Members (Admin)
1. Log in to the admin panel
2. Use the search bar to find specific members
3. Click the edit or delete buttons to manage members
4. Export data using the export button

### Viewing Statistics
1. Visit the dashboard
2. View real-time counters and statistics
3. Check the recent members list

## Limitations

- Maximum of 5 tungkulin per member
- Contact numbers must be 11 digits
- Data is stored locally (no cloud sync)
- No automatic backup system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the User Guide
2. Contact your system administrator
3. Ensure you're using a modern web browser
4. Clear your browser cache if experiencing issues

## Credits

- Font Awesome for icons
- Modern web standards and best practices
- Local Storage API for data persistence 