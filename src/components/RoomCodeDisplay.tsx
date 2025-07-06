interface RoomCodeDisplayProps {
  code: string;
}

const RoomCodeDisplay = ({ code }: RoomCodeDisplayProps) => {
  return (
    <div className="room-code-container">
      <div className="room-code-label">ROOM CODE</div>
      <div className="room-code-blocks">
        {code.split('').map((digit, index) => (
          <div key={index} className={`room-code-block color-${index % 5}`}>
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCodeDisplay; 