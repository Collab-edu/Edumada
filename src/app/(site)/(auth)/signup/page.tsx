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

      <div className='container mx-auto max-w-md px-4 pb-20'>
        <div className='rounded-2xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-gray-100 sm:px-8'>
          <SignUp />
        </div>
      </div>
    </>
  );
};

export default SignupPage;
