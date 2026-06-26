const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req, { params }) {
  try {
    const name = params.name;
    const res = await fetch(`${API_URL}/root-files/${name}`);
    if (!res.ok) return new Response('Not Found', { status: 404 });
    const text = await res.text();
    const contentType = res.headers.get('content-type') || 'text/plain';
    return new Response(text, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
