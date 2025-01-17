import { useState } from "react";
import VaultBox from "../components/common/vault-box";
import BackIcon from "../icons/back.svg";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import {
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  collection,
} from "firebase/firestore";
import { SyncLoader } from "react-spinners";
import { cn, unsanitizeKey } from "../lib/utils";
import { Vault } from "../types/vault";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { pageAtom, userAtom } from "../lib/atom";
import PrimaryButton from "@/components/common/primary-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";

const ImportPage = () => {
  // Set page navigation state
  const setPage = useSetRecoilState(pageAtom);

  // Retrieve user information from Recoil state
  const user = useRecoilValue(userAtom);

  // State to track the selected vaults for import
  const [selectedVault, setSelectedVault] = useState<Vault>();

  // Query to fetch vaults where the user has receipts but hasn't shared
  const vaultsQuery = query(
    collection(db, "vaults"),
    where("receipts", "array-contains", user?.email)
  );

  // Fetch vaults using React Query
  const {
    data: vaults,
    isLoading,
    refetch,
  } = useQuery<Vault[]>(
    "import-vaults",
    async () => {
      // Fetch documents from Firestore
      const vaultsSnapshot = await getDocs(vaultsQuery);

      // Map over the documents to create vault objects
      return vaultsSnapshot.docs.map((vaultData) => {
        const vault = vaultData.data();
        // Construct the URL for the vault
        const url = `https://${unsanitizeKey(vault.domain)}`;
        return {
          ...vault,
          id: vaultData.id,
          url,
        } as Vault;
      });
    },
    {
      refetchOnMount: false, // Disable refetch on mount
      refetchOnWindowFocus: false, // Disable refetch on window focus
    }
  );

  // Function to import selected vaults
  const importVault = async () => {
    const loadingToast = toast.loading("Importing Vault.");
    try {
      if (!selectedVault) {
        return toast.error("No selected vault.");
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url) {
        return toast.error("Can't get the current tab's url");
      }

      const tabDomain = new URL(tab.url).hostname;
      const vaultDomain = new URL(selectedVault.url).hostname;

      if (tabDomain !== vaultDomain) {
        return toast.error("Please go to the domain you're trying to import.");
      }

      await Promise.all(
        selectedVault.cookies.map(async (cookie) => {
          return await chrome.cookies.set({
            url: selectedVault.url,
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            expirationDate: cookie.expirationDate,
          });
        })
      );

      await chrome.tabs.sendMessage(tab.id!, {
        type: "set-local-storage",
        localStorage: selectedVault.localStorage,
      });

      // Update Firestore to mark the vault as imported
      await updateDoc(doc(db, "vaults", selectedVault.id), {
        imported: arrayUnion(user?.email),
      });
      toast.success("Success importing vault.");
      // Refetch vaults to update the list
      refetch();
    } catch (error) {
      toast.error("Error importing vault");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Function to split vaults into imported and not imported
  const splitVaults = (vaults?: Vault[]) => {
    const notImported =
      vaults?.filter((vault) => !vault.imported.includes(user!.email!)) ?? [];
    const imported =
      vaults?.filter((vault) => vault.imported.includes(user!.email!)) ?? [];
    return [notImported, imported];
  };

  const [notImported, imported] = splitVaults(vaults);

  return (
    <div className="h-full w-full text-white flex flex-col">
      <div className="flex pt-5 gap-4 grow-0 shrink basis-auto items-center p-3">
        <button
          onClick={() => {
            setPage(4); // navigate to main page
          }}
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <p className="text-xl">Import Vault</p>
      </div>
      <Tabs defaultValue="import" className="grow shrink basis-auto">
        <TabsList className="w-full flex mx-1 justify-between my-2">
          <TabsTrigger value="import">Not Imported</TabsTrigger>
          <TabsTrigger value="imported">Imported</TabsTrigger>
        </TabsList>

        <div className="w-full p-4 relative text-white">
          {isLoading ? (
            <div className="flex h-[18rem] items-center justify-center">
              <SyncLoader color="#0C21C1" />
            </div>
          ) : (
            <>
              <TabsContent
                value="import"
                className="flex right-0 flex-col relative"
              >
                <div className="h-[21rem] overflow-y-auto overflow-x-hidden">
                  {Number(notImported?.length) > 0 ? (
                    notImported.map((vault, index) => (
                      <VaultBox
                        index={index}
                        name={vault.url}
                        desc={`shared by ${vault.sharedBy}`}
                        id={vault.id}
                        key={vault.url}
                        added={vault.id === selectedVault?.id}
                        setAdded={() => {
                          if (selectedVault?.id === vault.id) {
                            // Remove vault from selectedVaults
                            setSelectedVault(undefined);
                          } else {
                            // Add vault to selectedVaults
                            setSelectedVault(vault);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="h-full w-full text-center justify-center flex items-center text-base font-medium">
                      No vaults which can be imported.
                    </div>
                  )}
                </div>
                <PrimaryButton
                  title="Import"
                  className={cn("w-[7rem] left-0 absolute bottom-3", {
                    hidden: !selectedVault,
                  })}
                  onClick={async () => {
                    await importVault();
                  }}
                />
              </TabsContent>

              <TabsContent
                value="imported"
                className="flex h-[21rem] overflow-y-auto overflow-x-hidden flex-col"
              >
                {Number(imported?.length) > 0 ? (
                  imported
                    .map((vault, index) => (
                      <VaultBox
                        index={index}
                        name={vault.url}
                        desc={`${vault.receipts.length} receipts`}
                        id={vault.id}
                        key={vault.url}
                      />
                    ))
                ) : (
                  <div className="h-[18rem] w-full text-center justify-center flex items-center text-base font-medium">
                    You've not imported any vaults.
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ImportPage;
