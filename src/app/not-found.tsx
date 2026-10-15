import NotFound from "@/components/not-found/NotFound";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
};

const ErrorPage = () => {
  return <NotFound />;
};

export default ErrorPage;
