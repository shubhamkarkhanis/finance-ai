const Card = ({ children, className }) => {
  return (
    <div className={`bg-[#161B22] p-5 rounded-lg border border-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
