import { useState } from "react";
import { Activity } from "lucide-react";

interface IconWrapperProps {
  stock: {
    icon?: string;
    name?: string;
    code?: string;
  };
}

export const IconWrapper = ({ stock }: IconWrapperProps) => {
  const [imgError, setImgError] = useState(false);
  const showImage = stock.icon && !imgError;
  console.log(showImage)
  return (
    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden">
      {showImage ? (
        <img id={stock.code}
          src={stock.icon}
          alt={stock.name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            setImgError(true)
          }}
        />
      ) : (
        <Activity className="w-5 h-5" />
      )}
    </div>
  );
};
