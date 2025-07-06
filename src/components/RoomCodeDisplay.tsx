interface RoomCodeDisplayProps {
  code: string;
}

const RoomCodeDisplay = ({ code }: RoomCodeDisplayProps) => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  return (
    <div className="room-code-container">
      <div className="room-code-label">ROOM CODE</div>
      <div className="room-code-blocks">
        {code.split('').map((digit, index) => (
          <div 
            key={index} 
            className="room-code-block"
            style={{ backgroundColor: colors[index % colors.length] }}
          >
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCodeDisplay; 