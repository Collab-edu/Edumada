import SignUp from "@/features/auth/components/SignUp";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
};

const SignupPage = () => {
  return (
    <>
      <Breadcrumb pageName="Inscription" />

      <SignUp />
    </>
  );
};

export default SignupPage;
