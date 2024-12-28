import { useForm } from "react-hook-form";
import BackIcon from "../icons/back.svg";
import Logo from "../components/common/Logo";
import toast from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth/web-extension";
import { auth } from "../lib/firebase";
import { useSetRecoilState } from "recoil";
import { pageAtom } from "../lib/atom";
import PrimaryButton from "@/components/common/primary-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema for form validation using Zod
const loginSchema = z
  .object({
    email: z.string().email({ message: "This email is invalid." }),
    password: z.string(),
  })
  .required();

const Login = () => {
  // Set page navigation state
  const setPage = useSetRecoilState(pageAtom);

  // Initialize form handling with react-hook-form and Zod schema
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Function to handle user login
  const loginUser = async (
    values: z.infer<typeof loginSchema>
  ): Promise<string> => {
    try {
      // Attempt to sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Check if the user's email is verified
      if (!userCredential.user.emailVerified) {
        // Sign out if email is not verified
        await signOut(auth);
        throw new Error("Email not verified");
      }
      return Promise.resolve("Login successfully.");
    } catch (error) {
      // Handle login errors
      return Promise.reject("Email or password is incorrect.");
    }
  };

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    // Show toast notification while logging in
    toast.promise(loginUser(values), {
      loading: "Signing in...",
      success: () => {
        // Navigate to the home page on successful login
        setPage(-1);
        return "Signed in successfully";
      },
      error: (error) => {
        return error;
      },
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full px-8 py-10 text-white"
        >
          <div className="flex mb-4 justify-center">
            <Logo />
          </div>
          <p className="text-white text-2xl font-semibold text-center my-2">
            Log In
          </p>

          <button
            className="mb-5 mt-3"
            onClick={() => {
              setPage(0); // go to Landing page
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
                  <Input placeholder="Email..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between my-2 text-sm">
            <div></div>
            <button
              onClick={() => {
                setPage(3); // Navigate to Forgot password page
              }}
              className="hover:scale-110 transition-all duration-300"
            >
              Forgot Password
            </button>
          </div>

          <div className="flex justify-end items-center mt-5">
            <PrimaryButton title="Login" type="submit" className="ml-auto" />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Login;
