import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  // 从URL参数中获取宽度和高度
  const resolvedParams = await params;
  const [width = '600', height = '400'] = resolvedParams.params;
  
  // 从查询参数中获取附加信息
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get('topic') || 'Sample Topic';
  const answer = searchParams.get('answer') || '1';
  
  // 创建一个简单的SVG占位图
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <rect x="20" y="20" width="${parseInt(width) - 40}" height="${parseInt(height) - 40}" fill="white" stroke="#ddd" stroke-width="2"/>
      <text x="50%" y="40%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#666">
        AI Agent 回答 ${answer}
      </text>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#999">
        ${topic}
      </text>
      <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="10" fill="#ccc">
        ${width} × ${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}