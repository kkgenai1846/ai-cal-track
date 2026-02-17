/**
 * Global color palette for the application.
 * Primary Color: Green (#51af73)
 */
export const Colors = {
    primary: '#51af73',
    primaryLight: '#EAF7EF', // Very light tint of primary
    primaryGradient: ['#51af73', '#51af73'] as const, // Solid gradient for now as requested: "linear-gradient(to right, #51af73 0%, #51af73 100%)"
    secondary: '#6a11cb', // Keeping old primary as secondary for now

    // UI Colors
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceHighlight: '#f5f5f5',

    white: '#ffffff',
    black: '#000000',

    // Text
    text: '#1a1a1a',
    textSecondary: '#666666',
    textLight: '#999999',
    textWhite: '#ffffff',

    // Border & Dividers
    border: '#eeeeee',
    borderDark: '#dddddd',

    // Status
    error: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14',

    // Components
    inputBackground: '#f5f5f5',
    inputPlaceholder: '#999999',

    // Social
    google: '#333333',
};
