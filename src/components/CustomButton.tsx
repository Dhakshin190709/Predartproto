import React from "react";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" |"cancel" |"confirm";
}

const CustomButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
  children,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-gradient-to-b from-[#004A99] to-[#007BFF] 
        hover:from-[#007BFF] hover:to-[#004A99] text-white 
        transition duration-150 ease-out hover:ease-in 
        py-2 px-5 rounded-lg ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
