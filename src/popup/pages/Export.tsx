import { useEffect, useState } from "react";
import BackIcon from "../icons/back.svg";
import VaultBox from "../components/common/vault-box";
import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { auth, db } from "../lib/firebase";
import { TagsInput } from "react-tag-input-component";
import { sanitizeKey, unsanitizeKey } from "../lib/utils";
import { SyncLoader } from "react-spinners";
import { Vault } from "../types/vault";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { pageAtom, selectedVaultAtom, userAtom } from "../lib/atom";
import PrimaryButton from "@/components/common/primary-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const ExportPage = () => {
  const [receipts, setReceipts] = useState<string[]>([]); // State to manage receipts
  const user = useRecoilValue(userAtom); // Get current user from Recoil state
  const setSelectedVault = useSetRecoilState(selectedVaultAtom); // Set selected vault in Recoil state
  const setPage = useSetRecoilState(pageAtom); // Set current page in Recoil state

  // Query to fetch vaults shared by the current user
  const vaultsQuery = query(
    collection(db, "vaults"),
    where("sharedBy", "==", user?.email)
  );

  // Use React Query to fetch vaults from Firestore
  const {
    data: vaults,
    isLoading,
    refetch,
  } = useQuery(
    "export-vaults",
    async () => {
      const vaults = await getDocs(vaultsQuery);
      return vaults.docs.map((vaultData) => {
        const vault = vaultData.data();
        const url = `https://${unsanitizeKey(vault.domain)}`;
        return {
          ...vault,
          id: vaultData.id,
          url,
        } as Vault;
      });
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onError: (value: any) =>
        toast.error(value?.message ?? "Error getting exported vaults."),
    }
  );

  const selectedVault = useRecoilValue(selectedVaultAtom);

  useEffect(() => {
    refetch(); // Refetch vaults when selectedVault changes
  }, [selectedVault, refetch]);

  const exportVault = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (receipts.length === 0) {
          return reject("No receipts available.");
        }

        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab.url || tab.url.startsWith("chrome://")) {
          return reject(
            "You can't export the localStorage and cookies from this tab."
          );
        }

        const cookies = await chrome.cookies.getAll({ url: tab.url });

        const localStorage = await chrome.tabs.sendMessage(
          tab.id!,
          "get-local-storage"
        );

        if (Object.keys(localStorage).length === 0 && cookies.length === 0) {
          return reject(
            "No Cookies or local storage data found for this current tab."
          );
        }

        // Sanitize the domain and localStorage keys
        const sanitizedDomain = sanitizeKey(new URL(tab.url!).hostname);
        const sanitizedLocalStorage: Record<string, any> = Object.keys(
          localStorage
        ).reduce((acc, key) => {
          acc[sanitizeKey(key)] = localStorage[key];
          return acc;
        }, {} as Record<string, any>);

        // Save the vault data to Firestore
        await setDoc(doc(collection(db, "vaults")), {
          domain: sanitizedDomain,
          cookies,
          localStorage: sanitizedLocalStorage,
          receipts,
          imported: [],
          sharedBy: user?.email,
        });

        refetch(); // Refetch vaults after exporting

        resolve(`Exported vault ${sanitizedDomain}`);
      } catch (error: any) {
        reject(error?.message || "Failed to Export Data");
      }
    });
  };

  return (
    <div className="w-full h-full text-white flex flex-col">
      <div className="flex grow-0 shrink basis-auto gap-4 items-center px-3 pb-3 pt-5">
        <button
          onClick={() => {
            setPage(4); // navigate to Home page
          }}
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <p className="text-xl">Export Vault</p>
      </div>
      <Tabs defaultValue="export" className="grow shrink basis-auto">
        <TabsList className="w-full flex mx-1 justify-between my-2">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="exported">Exported</TabsTrigger>
        </TabsList>

        <div className="w-full px-4 pb-4 text-white">
          <TabsContent
            value="export"
            className="flex h-full flex-col justify-between pt-2"
          >
            <TagsInput
              value={receipts}
              onChange={(receipts: string[]) => {
                // validate receipts
                let newReceipt = receipts[receipts.length - 1];
                if (
                  !/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim.test(newReceipt)
                ) {
                  toast.error("Enter valid email.");
                  receipts.pop();
                }
                if (newReceipt === auth.currentUser?.email) {
                  toast.error("You cannot add your own email");
                  receipts.pop();
                }
                setReceipts(receipts);
              }}
              name="email"
              classNames={{
                input: "border-0 bg-gray-900 w-full text-black bg-transparent",
                tag: "bg-blue-700 text-white",
              }}
              placeHolder="Enter Recepient's Email"
            />

            <div className="flex justify-end items-center mt-3">
              <PrimaryButton
                onClick={() => {
                  toast.promise(exportVault(), {
                    loading: "Exporting Data",
                    success: "Exported Data",
                    error: (error) => {
                      return error || "Failed to Export Data";
                    },
                  });
                }}
                title="Export"
              />
            </div>
          </TabsContent>

          <TabsContent
            value="exported"
            className="flex h-full flex-col relative mt-0"
          >
            <div className="h-[21rem]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <SyncLoader color="#0C21C1" />
                </div>
              ) : Number(vaults?.length) > 0 ? (
                vaults?.map((vault, index) => (
                  <VaultBox
                    index={index}
                    name={vault.url}
                    desc={`${vault.receipts.length} receipts`}
                    id={vault.id}
                    onClick={() => {
                      setSelectedVault({ ...vault, index }); // set vault to be displayed in selectedExport page
                      setPage(8); // navigate to ViewVault page
                    }}
                    key={vault.url}
                    className="hover:bg-gray-800 cursor-pointer"
                  />
                ))
              ) : (
                <div className="h-[18rem] w-full text-center justify-center flex items-center text-base font-medium">
                  You've not exported any vaults
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ExportPage;
