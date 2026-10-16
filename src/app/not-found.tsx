import NotFound from "@/components/not-found/NotFound";
import FicheRedirect from "@/components/not-found/FicheRedirect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
};

const ErrorPage = () => {
  return (
    <>
      <FicheRedirect />
      <NotFound />
    </>
  );
};

export default ErrorPage;
