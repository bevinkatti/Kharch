import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}