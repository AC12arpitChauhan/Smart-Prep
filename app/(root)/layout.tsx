import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="InterviewPrep AI Logo" width={32} height={28} />
          <span className="text-xl font-bold text-text-primary">InterviewPrep AI</span>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
