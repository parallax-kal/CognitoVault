import { useForm } from "react-hook-form";
import BackIcon from "../icons/back.svg";
import { useSetRecoilState } from "recoil";
import { pageAtom } from "../lib/atom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PrimaryButton from "@/components/common/primary-button";
import Logo from "@/components/common/Logo";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth/web-extension";
import { auth } from "@/lib/firebase";

// Define schema for form validation using Zod
const forgotSchema = z.object({
  email: z.string().email({ message: "This email is invalid" }),
});

const ForgotPassword = () => {
  const setPage = useSetRecoilState(pageAtom); // State to manage the current page
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema), // Integrate Zod schema with React Hook Form
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof forgotSchema>) => {
    toast.promise(sendPasswordResetEmail(auth, data.email), {
      loading: "Sending email...",
      success: "Reset link sent to your email if account exists.",
      error: "Error sending email.",
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)} // Handle form submission
          className="w-full p-4 py-10 text-white"
        >
          <div className="flex mb-4 justify-center">
            <Logo />
          </div>
          <p className="text-white text-xl text-center">Forgot Password</p>
          <button
            onClick={() => {
              setPage(0); // navigate to landing page
            }}
          >
            <BackIcon className="h-5 w-5" />
          </button>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email..." {...field} />{" "}
                </FormControl>
                <FormDescription>
                  Enter your Email so as to reset the password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mt-3">
            <PrimaryButton type="submit" title="Reset" />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
