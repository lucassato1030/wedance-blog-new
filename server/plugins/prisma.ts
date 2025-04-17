import { prisma } from '../database/prisma'

// This plugin ensures Prisma connection is available and handles cleanup
export default defineNitroPlugin(async (nitroApp) => {
  // Make prisma client available in the Nitro context
  nitroApp.hooks.hook('request', async () => {
    // You can add middleware-like logic here for db operations
  })

  // Close the Prisma connection when the app shuts down
  nitroApp.hooks.hook('close', async () => {
    await prisma.$disconnect()
  })
}) 