"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/authClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") ?? "/";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInValues) {
    setServerError(null);

    const toastId = toast.loading("Signing you in...");
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL,
          rememberMe: true,
        },
        {
          onRequest() {
            setServerError(null);
          },
          onError(ctx) {
            setServerError(ctx.error.message ?? "Unable to sign in.");
          },
          onSuccess() {
            toast.success("Signed in successfully", { id: toastId });
            router.push(callbackURL);
          },
        }
      );

      if (error) {
        toast.error(error.message ?? "Invalid email or password", {
          id: toastId,
        });
        setServerError(error.message ?? "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while signing in", { id: toastId });
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;

  return (
    <Card className="w-full border-0 bg-background/95 shadow-xl backdrop-blur-md">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-sm">
            V
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Valencia
          </span>
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue exploring Valencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={!!form.formState.errors.email}
                      className="h-11"
                    />
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
                  <FormLabel className="text-sm font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={!!form.formState.errors.password}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting || !isDirty || !isValid}
              aria-busy={isSubmitting}
              className="mt-2 h-11 w-full bg-orange-600 text-base font-medium shadow-md transition-all hover:bg-orange-700 hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-6">
        <div className="w-full text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={{
              pathname: "/signup",
              query: callbackURL ? { callbackURL } : undefined,
            }}
            className="font-medium text-orange-600 underline-offset-4 transition-colors hover:text-orange-700 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}