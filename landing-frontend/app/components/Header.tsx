"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header({ openLogin }: any){

  const router = useRouter();
  const {logged,logout} = useAuth();

  return (

    <div className="w-full border-b border-white/10 bg-black/40 backdrop-blur">

      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6 text-white">

        <div
          onClick={()=>router.push("/")}
          className="text-lg font-bold cursor-pointer"
        >
          ⚡ AI Builder
        </div>

        <div className="flex gap-4">

          {!logged ? (

            <button
              onClick={openLogin}
              className="bg-purple-600 px-4 py-2 rounded"
            >
              Login
            </button>

          ) : (

            <>
              <button
                onClick={()=>router.push("/admin")}
                className="bg-white/10 px-4 py-2 rounded"
              >
                Dashboard
              </button>

              <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>

          )}

        </div>

      </div>

    </div>

  );

}