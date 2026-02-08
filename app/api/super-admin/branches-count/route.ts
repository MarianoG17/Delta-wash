import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';

export async function GET(request: Request) {
  try {
    const db = await getDBConnection();

    // Contar branches activos (empresas con neon_branch_id)
    const result = await db.get(`
      SELECT COUNT(*) as total
      FROM empresas
      WHERE neon_branch_id IS NOT NULL
    `);

    return NextResponse.json({
      total: result?.total || 0,
      limit: 10 // Límite de Neon en plan gratuito
    });
  } catch (error) {
    console.error('Error counting branches:', error);
    return NextResponse.json(
      { error: 'Error al contar branches' },
      { status: 500 }
    );
  }
}
