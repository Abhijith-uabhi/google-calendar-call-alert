'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();

  console.log("Session data: ", session);


  if (status==="loading") {
    redirect('/login'); // ✅ works perfectly
  }else {
    redirect('/dashboard'); // ✅ works perfectly
  }

}