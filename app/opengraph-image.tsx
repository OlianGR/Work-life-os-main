import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Work Life OS | Control Total para el Freelance';
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
          background: '#FFFF00',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          border: '20px solid black',
          padding: '40px',
        }}
      >
        {/* Banner Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            border: '8px solid black',
            padding: '40px 80px',
            boxShadow: '15px 15px 0px rgba(0,0,0,1)',
          }}
        >
          <h1
            style={{
              fontSize: '80px',
              fontWeight: '900',
              margin: '0',
              color: 'black',
              textTransform: 'uppercase',
            }}
          >
            Work Life OS
          </h1>
          <p
            style={{
              fontSize: '32px',
              margin: '20px 0 0 0',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            Optimiza tu vida laboral con IA
          </p>
        </div>
        
        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            background: '#FF00FF',
            color: 'white',
            padding: '10px 20px',
            border: '4px solid black',
            fontWeight: 'bold',
            fontSize: '24px',
            boxShadow: '8px 8px 0px rgba(0,0,0,1)',
          }}
        >
          olianlabs.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
