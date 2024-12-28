import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BackIcon from "../icons/back.svg";
import Logo from "../components/common/Logo";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth/web-extension";
import toast from "react-hot-toast";
import { useSetRecoilState } from "recoil";
import { pageAtom } from "../lib/atom";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import PrimaryButton from "@/components/common/primary-button";
import { doc, setDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";

// Zod schema for form validation
const signupSchema = z
  .object({
    fullname: z.string().min(3, {
      message: "The fullname must be greater than 3 characters.",
    }),
    username: z.string().min(3, {
      message: "The username must be greater than 3 characters.",
    }),
    email: z.string().email({ message: "This email is invalid." }),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{8,}$/,
        {
          message:
            "The password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character from @$!%*?&#^.",
        }
      ),
    confirmPassword: z.string(),
    accepted: z.boolean(),
  })
  .required()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  // Set page navigation state
  const setPage = useSetRecoilState(pageAtom);

  // Initialize form handling with react-hook-form and Zod schema
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullname: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      accepted: false,
    },
  });

  // Function to create a new user
  const createUser = async (values: z.infer<typeof signupSchema>) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Save user details in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullname: values.fullname,
        username: values.username,
      });

      // Sign out the user after signup
      await auth.signOut();
    } catch (error: any) {
      throw new Error(error.message ?? "Something went wrong");
    }
  };

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    toast.promise(createUser(values), {
      loading: "Signing up...",
      success: "Email verification link set",
      error: (error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            return "Email already in use";
          case "auth/invalid-email":
            return "Invalid email";
          case "auth/weak-password":
            return "Weak password";
          default:
            return "Something went wrong";
        }
      },
    });
  };

  return (
    <div className="w-full h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full h-full px-8 py-10 text-white"
        >
          <div className="flex mb-4 justify-center">
            <Logo />
          </div>
          <p className="text-white text-2xl font-semibold my-2 text-center">
            Sign Up
          </p>

          <button
            className="mb-3"
            onClick={() => {
              setPage(0); // navigate to landing page
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Password..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm Password..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="accepted"
            render={({ field }) => (
              <FormItem className="flex mt-2 gap-1.5 flex-row items-start">
                <FormControl>
                  <Checkbox
                    className="mt-2 border border-solid border-white"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Accept Terms of Service and Privacy Policy
                  </FormLabel>
                  <FormDescription>
                    By Signing up you accept&nbsp;
                    <a
                      href="https://cognitovault.vercel.app/privacy-policy.html"
                      className="text-blue-600"
                      target="_blank"
                    >
                      Privacy Policy
                    </a>
                    &nbsp; and &nbsp;
                    <a
                      href="https://cognitovault.vercel.app/terms-of-service.html"
                      className="text-blue-600"
                      target="_blank"
                    >
                      Terms of Service
                    </a>
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex mt-3 justify-end pb-4 w-full">
            <PrimaryButton title="Signup" type="submit" />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Signup;
