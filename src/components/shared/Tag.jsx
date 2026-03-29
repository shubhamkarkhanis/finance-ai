const Tag = ({ children, type }) => {
  const baseClasses = "text-xs font-bold px-2 py-1 rounded-full";
  const typeClasses = {
    positive: "bg-green-500/20 text-green-400",
    negative: "bg-red-500/20 text-red-400",
    neutral: "bg-gray-500/20 text-gray-300",
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type] || typeClasses.neutral}`}>
      {children}
    </span>
  );
};

export default Tag;
