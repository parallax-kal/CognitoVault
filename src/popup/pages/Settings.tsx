import Logo from "@/components/common/Logo";
import { pageAtom, userAtom } from "@/lib/atom";
import { auth, db } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
} from "firebase/auth/web-extension";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRecoilState, useSetRecoilState } from "recoil";
import { z } from "zod";
import BackIcon from "../icons/back.svg";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PrimaryButton from "@/components/common/primary-button";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

// Schema for form validation using Zod
const settingsSchema = z
  .object({
    email: z.string().email({ message: "This email is invalid." }),
    fullname: z.string().min(3, {
      message: "The fullname must be greater than 3 characters.",
    }),
    username: z.string().min(3, {
      message: "The username must be greater than 3 characters.",
    }),
  })
  .required();

const Settings = () => {
  // Set page navigation state
  const setPage = useSetRecoilState(pageAtom);

  // State management for user data
  const [user, setUser] = useRecoilState(userAtom);

  // Initialize form handling with react-hook-form and Zod schema
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      email: user?.email ?? "",
      fullname: user?.fullname ?? "",
      username: user?.username ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("email", user.email ?? "");
      form.setValue("fullname", user.fullname ?? "");
      form.setValue("username", user.username ?? "");
    }
  }, [user]);
  // Function to update user data in Firebase and local state
  const updateUserData = async (values: z.infer<typeof settingsSchema>) => {
    try {
      const { fullname, username, email } = values;
      const hasNameChanges =
        fullname !== user?.fullname || username !== user?.username;
      const hasEmailChange = email !== user?.email;

      if (hasNameChanges || hasEmailChange) {
        // Update Firestore document for name changes
        if (hasNameChanges) {
          await updateDoc(doc(db, "users", user!.uid), {
            fullname,
            username,
          });

          // Update local state with new name details
          setUser({ ...user!, fullname, username });
        }

        // Handle email change and verify email
        if (hasEmailChange) {
          await verifyBeforeUpdateEmail(auth.currentUser!, email);
        }

        return Promise.resolve("Updated User");
      } else {
        return Promise.reject("Please change some data.");
      }
    } catch (error: any) {
      return Promise.reject(error.message ?? "Something went wrong");
    }
  };

  // Function to handle form submission
  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    toast.promise(updateUserData(values), {
      loading: "Updating...",
      error: (error) => error,
      success: "Your account was updated.",
    });
  };

  return (
    <div className="h-full w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full px-8 py-10 text-white"
        >
          <div className="flex mb-4 justify-center">
            <Logo />
          </div>
          <p className="text-white text-2xl font-semibold my-2 text-center">
            Settings
          </p>

          <button
            className="mb-3"
            onClick={() => {
              setPage(4); // Go to Home page
            }}
          >
            <BackIcon className="h-5 w-5" />
          </button>

          <div className="flex gap-3 flex-col">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fullname</FormLabel>
                  <FormControl>
                    <Input placeholder="Fullname..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormLabel>Password</FormLabel>
              <button
                type="button"
                className="bg-slate-300 rounded-md px-2 py-1 text-black"
                onClick={() => {
                  toast.promise(sendPasswordResetEmail(auth, user!.email!), {
                    loading: "Sending Password Reset Link...",
                    error: "Something went wrong.",
                    success: "Password Reset Link sent.",
                  });
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="flex mt-3 justify-end w-full">
            <PrimaryButton title="Update" type="submit" />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Settings;
