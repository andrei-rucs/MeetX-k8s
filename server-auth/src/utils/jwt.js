import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export function generateAccessToken(user) {
    return jwt.sign(
        {
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': user.id.toString(),
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': user.name,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': user.email
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
    );
}

export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Map back from .NET claim types to simple properties for easier use
        return {
            id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        };
    } catch (error) {
        return null;
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
}
