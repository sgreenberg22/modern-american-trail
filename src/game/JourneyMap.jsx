import React from 'react';

const JourneyMap = ({ locations, currentLocationIndex, distanceToNext, etaDays }) => {
  const width = 800;
  const height = 400;
  const padding = 50;

  const totalLocations = locations.length;
  const segmentWidth = (width - padding * 2) / (totalLocations - 1);

  // Find the y-position with some variation
  const getY = (index) => {
    return height / 2 + Math.sin(index * 0.5) * (height / 4);
  };

  return (
    <div style={{ background: '#0b1220', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {/* "Fog of war" for the upcoming path */}
        <path
          d={`M ${padding + currentLocationIndex * segmentWidth},${getY(currentLocationIndex)} ` +
             locations.slice(currentLocationIndex).map((loc, i) =>
               `L ${padding + (currentLocationIndex + i) * segmentWidth},${getY(currentLocationIndex + i)}`
             ).join(' ')}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="4"
          strokeDasharray="8 8"
        />
        {/* Solid line for the path already traveled */}
        <path
          d={"M " + locations.slice(0, currentLocationIndex + 1).map((loc, i) =>
               `${padding + i * segmentWidth},${getY(i)}`
             ).join(' L ')}
          fill="none"
          stroke="#22c55e"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Location markers */}
        {locations.map((loc, index) => {
          const isCity = loc.type === 'city';
          const isTraveled = index <= currentLocationIndex;
          const isCurrent = index === currentLocationIndex;

          const cx = padding + index * segmentWidth;
          const cy = getY(index);
          const r = isCity ? 10 : 5;

          return (
            <g key={index}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={isCity ? '#fde68a' : '#93c5fd'}
                stroke={isCurrent ? '#f43f5e' : '#fff'}
                strokeWidth={isCurrent ? 3 : 1}
                opacity={isTraveled ? 1 : 0.4}
              />
              {isCity && (
                <text x={cx} y={cy + 25} textAnchor="middle" fill="#cbd5e1" fontSize="12">
                  {loc.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Player marker */}
        <circle cx={padding + currentLocationIndex * segmentWidth} cy={getY(currentLocationIndex)} r="8" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
      </svg>
      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#cbd5e1', display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9aa3b2' }}>NEXT STOP</div>
          <div style={{ fontWeight: 'bold' }}>{locations[currentLocationIndex + 1]?.name || 'Destination'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#9aa3b2' }}>DISTANCE</div>
          <div style={{ fontWeight: 'bold' }}>{distanceToNext} mi</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#9aa3b2' }}>ETA</div>
          <div style={{ fontWeight: 'bold' }}>~{etaDays} day(s)</div>
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;