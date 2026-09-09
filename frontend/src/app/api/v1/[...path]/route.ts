import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = path.join('/');
    const backendUrl = `http://backend:3001/api/v1/${pathname}`;
    
    console.log('🔗 Proxying POST to:', backendUrl);
    
    const body = await request.text();
    const headers = new Headers();
    
    // Forward relevant headers
    if (request.headers.get('content-type')) {
      headers.set('Content-Type', request.headers.get('content-type')!);
    }
    if (request.headers.get('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: body || undefined,
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    
    if (response.headers.get('content-type')) {
      responseHeaders.set('Content-Type', response.headers.get('content-type')!);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = path.join('/');
    const backendUrl = `http://backend:3001/api/v1/${pathname}`;
    
    console.log('🔗 Proxying GET to:', backendUrl);
    
    const headers = new Headers();
    
    // Forward relevant headers
    if (request.headers.get('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    
    if (response.headers.get('content-type')) {
      responseHeaders.set('Content-Type', response.headers.get('content-type')!);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = path.join('/');
    const backendUrl = `http://backend:3001/api/v1/${pathname}`;
    
    const body = await request.text();
    const headers = new Headers();
    
    if (request.headers.get('content-type')) {
      headers.set('Content-Type', request.headers.get('content-type')!);
    }
    if (request.headers.get('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: body || undefined,
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    
    if (response.headers.get('content-type')) {
      responseHeaders.set('Content-Type', response.headers.get('content-type')!);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = path.join('/');
    const backendUrl = `http://backend:3001/api/v1/${pathname}`;
    
    const headers = new Headers();
    
    if (request.headers.get('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    
    if (response.headers.get('content-type')) {
      responseHeaders.set('Content-Type', response.headers.get('content-type')!);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}
