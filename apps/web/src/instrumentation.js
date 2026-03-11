// This file runs once when the Next.js server starts up.
// It fixes the Windows DNS issue with MongoDB SRV records.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
}
