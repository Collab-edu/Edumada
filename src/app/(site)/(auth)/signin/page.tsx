import Signin from "@/features/auth/components/SignIn";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
};

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageName="Connexion" />

      <div className='container mx-auto max-w-md px-4 pb-20'>
        <div className='rounded-2xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-gray-100 sm:px-8'>
          <Signin />
        </div>
      </div>
    </>
  );
};

export default SigninPage;
