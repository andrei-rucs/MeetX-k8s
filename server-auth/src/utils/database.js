import pg from 'pg';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

// Parse DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: databaseUrl,
});

// Salt identical cu cel din .NET (PasswordUtils.cs)
const SALT = Buffer.from([
    0xAF, 0xA5, 0xB5, 0x46,
    0xD1, 0xA7, 0xB6, 0xB8,
    0xFD, 0xA1, 0xB2, 0x37,
    0xFA, 0xF1, 0x32, 0x46
]);

// Hash password folosind exact același algoritm ca în .NET
function hashPassword(password) {
    return crypto.pbkdf2Sync(password, SALT, 1000, 32, 'sha256').toString('base64');
}

// Verify password
export function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

export async function initDatabase() {
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL database');
        client.release();
    } catch (error) {
        console.error('❌ Database connection error:', error);
        throw error;
    }
}

export async function getUserByEmail(email) {
    const result = await pool.query(
        'SELECT "Id" as id, "Email" as email, "Password" as password, "Name" as name, "Role" as role FROM "User" WHERE "Email" = $1',
        [email]
    );
    return result.rows[0];
}

export async function getUserById(id) {
    const result = await pool.query(
        'SELECT "Id" as id, "Email" as email, "Name" as name, "Role" as role FROM "User" WHERE "Id" = $1',
        [id]
    );
    return result.rows[0];
}

export async function createUser(userData) {
    const hashedPassword = hashPassword(userData.password);
    const id = uuidv4();

    // Generate ShortName from name (first 2 letters of each word, or first 2 chars)
    const nameParts = userData.name.trim().split(' ');
    const shortName = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : userData.name.substring(0, 2).toUpperCase();

    // Random color from .NET list
    const colors = ['#e03f4f', '#c16ca8', '#a86cc1', '#6ca8c1', '#98fb98', '#3fe0d0', '#26abff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Insert user with all required fields
    const result = await pool.query(
        `INSERT INTO "User" ("Id", "Email", "Password", "Name", "Position", "Role", "ShortName", "Color", "AvatarPath", "Status", "CreatedAt", "UpdatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, false, NOW(), NOW())
         RETURNING "Id" as id, "Email" as email, "Name" as name, "Role" as role, "Position" as position, "ShortName" as "shortName", "Color" as color`,
        [id, userData.email, hashedPassword, userData.name, userData.position || '', userData.role || 'Client', shortName, color]
    );

    const user = result.rows[0];

    // Add user to group via GroupUser table
    if (userData.groupId) {
        await pool.query(
            `INSERT INTO "GroupUser" ("GroupsId", "UsersId") VALUES ($1, $2)`,
            [userData.groupId, id]
        );
        user.groupId = userData.groupId;
    }

    return user;
}

export async function updateUser(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.email) {
        fields.push(`"Email" = $${paramIndex++}`);
        values.push(updates.email);
    }
    if (updates.name) {
        fields.push(`"Name" = $${paramIndex++}`);
        values.push(updates.name);
    }
    if (updates.password) {
        const hashedPassword = hashPassword(updates.password);
        fields.push(`"Password" = $${paramIndex++}`);
        values.push(hashedPassword);
    }
    if (updates.position) {
        fields.push(`"Position" = $${paramIndex++}`);
        values.push(updates.position);
    }

    if (fields.length === 0) return null;

    fields.push(`"UpdatedAt" = NOW()`);
    values.push(id);

    const result = await pool.query(
        `UPDATE "User" SET ${fields.join(', ')} WHERE "Id" = $${paramIndex}
         RETURNING "Id" as id, "Email" as email, "Name" as name, "Role" as role`,
        values
    );

    return result.rows[0];
}

export async function deleteUser(id) {
    const result = await pool.query('DELETE FROM "User" WHERE "Id" = $1', [id]);
    return result.rowCount > 0;
}

// Refresh tokens - these can be stored in memory or a separate table
// For simplicity, using in-memory storage
const refreshTokens = new Map();

export function saveRefreshToken(token, userId) {
    refreshTokens.set(token, { userId, createdAt: new Date() });
}

export function findRefreshToken(token) {
    const data = refreshTokens.get(token);
    return data ? { token, ...data } : null;
}

export function removeRefreshToken(token) {
    refreshTokens.delete(token);
}

// Reset tokens - in-memory storage
const resetTokens = new Map();

export function saveResetToken(token, userId) {
    resetTokens.set(token, {
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
}

export function findResetToken(token) {
    const data = resetTokens.get(token);
    if (!data) return null;
    if (new Date() > data.expiresAt) {
        resetTokens.delete(token);
        return null;
    }
    return { token, ...data };
}

export function removeResetToken(token) {
    resetTokens.delete(token);
}

export async function getPublicGroups() {
    const result = await pool.query(
        'SELECT "Id" as id, "Name" as name, "ShortName" as "shortName", "Color" as color, "isPublic" as "isPublic" FROM "Group" WHERE "isPublic" = true'
    );
    return result.rows;
}

export async function getGroupById(id) {
    const result = await pool.query(
        'SELECT "Id" as id, "Name" as name, "ShortName" as "shortName", "Color" as color, "isPublic" as "isPublic" FROM "Group" WHERE "Id" = $1',
        [id]
    );
    return result.rows[0];
}

export async function getUsers() {
    const result = await pool.query(
        'SELECT "Id" as id, "Email" as email, "Name" as name, "Role" as role FROM "User"'
    );
    return result.rows;
}
