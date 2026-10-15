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

      <Signin />
    </>
  );
};

export default SigninPage;
