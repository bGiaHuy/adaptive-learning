import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({status:'ok',database:'connected',provider:process.env.CLOUDFLARE_DATA_URL?'cloudflare-d1':'configured-prisma'}, {headers:{'cache-control':'no-store'}});
  } catch {
    return Response.json({status:'unavailable',database:'unavailable'}, {status:503,headers:{'cache-control':'no-store'}});
  }
}
