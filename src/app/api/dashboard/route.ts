import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
