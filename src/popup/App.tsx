import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/Home";
import ImportPage from "./pages/Import";
import ExportPage from "./pages/Export";
import { SyncLoader } from "react-spinners";
import ProfileIcon from "./icons/profile.svg";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth/web-extension";
import { useRecoilState, useSetRecoilState } from "recoil";
import { pageAtom, userAtom } from "./lib/atom";
import { signOut } from "firebase/auth/web-extension";
import Settings from "./pages/Settings";
import { doc, getDoc } from "firebase/firestore";
import ViewVault from "./pages/ViewVault";
import { cn } from "./lib/utils";

function App() {
  // State to keep track of the current page and user information
  const [currentPage, setCurrentPage] = useRecoilState(pageAtom);
  const setUser = useSetRecoilState(userAtom);

  // Array of components to render based on the current page index
  const pages = [
    <Landing />,
    <Login />,
    <Signup />,
    <ForgotPassword />,
    <HomePage />,
    <Settings />,
  ];

  const authorizedPages = [<ImportPage />, <ExportPage />, <ViewVault />];
  // State to control the visibility of the navigation menu
  const [showingNav, setShowingNav] = useState(false);

  // Effect to handle authentication state changes
  useEffect(() => {
    // Listen for authentication state changes
    onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser === null) {
          setCurrentPage(0);
        }
        try {
          // Check if the user is authenticated and email is verified
          if (firebaseUser?.emailVerified) {
            const user = JSON.parse(JSON.stringify(firebaseUser));
            if (user) {
              // Fetch user data from Firestore
              const userDatasnapshot = await getDoc(
                doc(db, "users", firebaseUser!.uid)
              );
              if (userDatasnapshot.exists()) {
                // Extract user details and update state
                const { fullname, username, email } = userDatasnapshot.data();
                setUser({
                  ...user,
                  fullname,
                  username,
                });
                setCurrentPage(4); // Navigate to the HomePage (index 4)
                return;
              } else {
                setCurrentPage(0);
              }
            } else {
              setCurrentPage(0);
            }
          }
        } catch (error) {
          setCurrentPage(0);
        }
      },
      () => {
        setCurrentPage(0);
      }
    );
  }, []);

  return (
    <div
      onClick={() => {
        // Hide the navigation menu when clicking outside
        setShowingNav(false);
      }}
      className="w-[400px] overflow-x-hidden flex relative flex-col h-[500px] bg-gray-900  items-center justify-center"
    >
      {currentPage > 3 && (
        <div className=" absolute top-2 right-4 flex flex-col items-end gap-2">
          <button
            onClick={() => {
              // Show the navigation menu with a delay
              setTimeout(() => {
                setShowingNav(true);
              }, 100);
            }}
            className="cursor-pointer w-10"
          >
            <ProfileIcon />
          </button>
          {showingNav && (
            <div className="w-[200px] bg-white shadow-sm shadow-white transition-all duration-300 rounded-md">
              <button
                onClick={() => {
                  // Navigate to the Settings page
                  setCurrentPage(5);
                }}
                className="py-1 px-4 hover:bg-blue-400 rounded-b-md hover:text-white w-full text-left"
              >
                Settings
              </button>
              <button
                onClick={async () => {
                  // Sign out the user and navigate to the Login page
                  await signOut(auth);
                  setCurrentPage(1);
                  setUser(null);
                }}
                className="py-1 px-4 hover:bg-blue-400 rounded-b-md hover:text-white w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {currentPage > 5 && authorizedPages[currentPage - 6]}

      {currentPage === -1 && <SyncLoader color="white" />}

      {pages.map((page, index) => (
        <div
          key={index}
          className={cn("w-full", {
            "hidden h-0 w-0": index !== currentPage,
          })}
        >
          {page}
        </div>
      ))}
    </div>
  );
}

export default App;
