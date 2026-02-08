import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    if (!process.env.CENTRAL_DB_URL) {
      return NextResponse.json(
        { error: 'Base de datos central no configurada' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.CENTRAL_DB_URL);

    // Contar branches activos (empresas con neon_branch_id)
    const result = await sql`
      SELECT COUNT(*) as total
      FROM empresas
      WHERE neon_branch_id IS NOT NULL
    `;

    return NextResponse.json({
      total: Number(result[0]?.total) || 0,
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
