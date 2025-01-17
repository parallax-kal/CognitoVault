import { useState } from "react";
import Logo from "../components/common/Logo";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { pageAtom, userAtom } from "../lib/atom";
import PrimaryButton from "@/components/common/primary-button";
import ProfileIcon from "@/icons/profile.svg";

const HomePage = () => {
  const setPage = useSetRecoilState(pageAtom); // Manage page navigation
  const [showingNav, setShowingNav] = useState(false); // State to control navigation visibility
  const user = useRecoilValue(userAtom); // Get user information from Recoil state

  return (
    <div
      className="flex flex-col w-full items-center justify-center gap-5 relative text-white"
      onClick={() => showingNav && setShowingNav(false)} // Close navigation if visible and clicking outside
    >
      <div className="flex text-[14px] flex-col items-center gap-2">
        <ProfileIcon className="h-14" />
        <div>@{user?.username}</div>
        <div>{user?.email}</div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <PrimaryButton
          title="Import"
          onClick={() => {
            setPage(6); // navigate to import page
          }}
        />
        <PrimaryButton
          title="Export"
          onClick={() => {
            setPage(7); // navigate to export page
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
