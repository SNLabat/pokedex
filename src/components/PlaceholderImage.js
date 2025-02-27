export default function PlaceholderImage({ width = 200, height = 200, text = "Pokémon" }) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#333',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
} 