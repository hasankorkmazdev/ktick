import { useState } from "react";
import { Activity } from "lucide-react";

interface IconWrapperProps {
  data: {
    icon?: string;
  };
}

export const IconWrapper = ({ data }: IconWrapperProps) => {
  const [imgError, setImgError] = useState(false);
    data.icon="https://logo.clearbit.com/bim.com.tr";
  const showImage = data.icon && !imgError;

  return (
    <div className="rounded-full w-10 h-10 flex items-center justify-center  text-primary-foreground">
      {showImage ? (
        <img
          src={data.icon}
          alt="icon"
          className="rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <Activity className="w-5 h-5" />
      )}
    </div>
  );
};
