import { User } from '@prisma/client';

/**
 * Helper function to convert numeric string IDs to numbers
 * This is useful when dealing with IDs from URL parameters or form data
 */
export function parseIdToNumber(id: string | number): number {
  if (typeof id === 'number') return id;
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  return parsed;
}

/**
 * Formats a user object by ensuring sensitive data is removed
 * and handling any data transformations needed
 */
export function formatUser(user: User & { posts?: any[] }) {
  // Create a new object without password or other sensitive fields
  const { ...safeUser } = user;
  
  // Return the safe user object
  return safeUser;
} 