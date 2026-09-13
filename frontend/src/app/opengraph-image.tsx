import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NERA - Neuro-Adaptive Cloud Learning';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #5B7B5A 0%, #3d5a3c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'radial-gradient(circle at 20% 30%, white 2px, transparent 2px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Brain Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '120px',
              display: 'flex',
            }}
          >
            🧠
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            NERA
          </h1>
          <p
            style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '30px',
              maxWidth: '900px',
            }}
          >
            Neuro-Adaptive Cloud Learning
          </p>
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Platform pembelajaran berbasis EEG untuk meningkatkan fokus dan performa belajar
          </p>
        </div>

        {/* Stats Badge */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>98%</div>
            <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>Akurasi</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>24/7</div>
            <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>Real-time</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
