import PrimaryButton from "@/components/common/primary-button";
import { pageAtom, selectedVaultAtom } from "@/lib/atom";
import { auth, db } from "@/lib/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRecoilState, useSetRecoilState } from "recoil";
import { TagsInput } from "react-tag-input-component";
import { useEffect, useState } from "react";
import { unsanitizeKey } from "@/lib/utils";
import BackIcon from "../icons/back.svg";
import Logo from "@/components/common/Logo";

const ViewVault = () => {
  // Recoil state management for selected vault and page navigation
  const [selectedVault, setSelectedVault] = useRecoilState(selectedVaultAtom);
  const [receipts, setReceipts] = useState(selectedVault?.receipts ?? []);
  const setPage = useSetRecoilState(pageAtom);
  const [isEdited, setIsEdited] = useState(false);

  // Effect to detect changes in receipts and update the edited state
  useEffect(() => {
    const receiptsChanged = !compareReceipts(
      receipts,
      selectedVault?.receipts ?? []
    );
    setIsEdited(receiptsChanged);
  }, [receipts, selectedVault?.receipts]);

  // Function to compare two arrays of receipts
  const compareReceipts = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;

    // Sort and compare both arrays
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((val, index) => val === sortedB[index]);
  };

  // Function to delete the selected vault
  const deleteVault = async () => {
    await deleteDoc(doc(db, "vaults", selectedVault!.id));
    setPage(6); // Navigate to a different page after deletion
    setSelectedVault(null); // Clear selected vault
  };

  // Function to update the selected vault
  const updateVault = async () => {
    if (isEdited) {
      await updateDoc(doc(db, "vaults", selectedVault!.id), {
        receipts,
      });
      setSelectedVault({
        ...selectedVault!,
        receipts,
      });
    }
  };

  return !selectedVault ? null : (
    <div className="h-full px-6 pt-16 w-full text-white flex flex-col">
      <div className="flex mb-4 justify-center">
        <Logo />
      </div>

      <button onClick={() => setPage(6)}>
        <BackIcon className="h-5 w-5" />
      </button>

      <p className="text-xl my-4">
        {selectedVault.index + 1}.{" "}
        {`https://${unsanitizeKey(selectedVault.domain)}`}
      </p>

      <TagsInput
        value={receipts}
        onChange={(receipts: string[]) => {
          let newReceipt = receipts[receipts.length - 1];
          // Validate email format
          if (!/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim.test(newReceipt)) {
            toast.error("Enter valid email.");
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

      <div className="flex items-center gap-4 justify-end mt-4">
        <PrimaryButton
          title="Delete"
          className="w-[7rem]"
          onClick={() => {
            toast.promise(deleteVault(), {
              loading: "Deleting vault",
              error: "Error deleting Vault",
              success: "Vault deleted",
            });
          }}
        />
        <PrimaryButton
          title="Update"
          disabled={!isEdited}
          className="w-[7rem]"
          onClick={() => {
            toast.promise(updateVault(), {
              loading: "Updating vault",
              error: "Error updating Vault",
              success: "Vault updated",
            });
          }}
        />
      </div>
    </div>
  );
};

export default ViewVault;
