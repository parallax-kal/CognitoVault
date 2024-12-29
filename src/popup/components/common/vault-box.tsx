import React from "react";
import AddBtnIcon from "@/icons/add.svg";
import CheckmarkIcon from "@/icons/check.svg";
import { cn } from "@/lib/utils";
import WebsiteIcon from "@/icons/website.svg";

// Define the props expected by the VaultBox component
interface Props {
  index: number; // Index of the item
  name: string; // Name of the item
  id: string; // Id of the item
  desc: string; // Description of the item
  added?: boolean;
  setAdded?: () => void; // Optional callback to notify if item was added
  className?: string; // Optional additional CSS classes
  onClick?: React.MouseEventHandler<HTMLDivElement>; // Optional click handler for the container
}

// Functional component to display a box for a vault item
const VaultBox: React.FC<Props> = ({
  name,
  index,
  desc,
  setAdded,
  added,
  onClick,
  className,
  id,
}) => {
  return (
    <div
      className={cn(
        "border-b border-[#0C21C1] flex gap-2 py-2 my-2 justify-between px-2 w-full", // Base styling for the component
        className
      )}
      onClick={onClick} // Click handler for the entire component
    >
      <div className="flex justify-between items-center gap-2">
        <div className="text-lg">{index + 1}.</div>
        <div className="w-[46px] h-[46px] rounded-full">
          <WebsiteIcon className="w-full h-full" />
        </div>{" "}
        <div>
          <p className="text-base">{name}</p>
          <p className="text-gray-400 text-sm">{desc}</p>{" "}
        </div>
      </div>
      {setAdded && (
        <button className="w-[5%]" onClick={() => setAdded()}>
          {added ? <CheckmarkIcon /> : <AddBtnIcon />}{" "}
        </button>
      )}
    </div>
  );
};

export default VaultBox;
