"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "./utils/auth";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";

export default function Home() {

  const router = useRouter();

  const [prompt,setPrompt] = useState("");
  const [loading,setLoading] = useState(false);
  const [showAuth,setShowAuth] = useState(false);
  const [logged,setLogged] = useState(isLoggedIn());

  function logout(){

    localStorage.removeItem("token");
    setLogged(false);
    window.location.reload();

  }

  async function generate(){

    if(!isLoggedIn()){
      setShowAuth(true);
      return;
    }

    try{

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}generate/`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
          },
          body:JSON.stringify({ prompt })
        }
      );

      const data = await res.json();

      router.push(`/edit/${data.page_id}`);

    }catch(err){

      console.error(err);
      alert("Error generating page");

    }finally{
      setLoading(false);
    }

  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900 text-white flex flex-col items-center px-6">

      <Header openLogin={()=>setShowAuth(true)} />

      {/* HERO */}

      <h1 className="text-5xl font-bold mb-6 mt-10 text-center">
        AI Landing Page Builder
      </h1>

      <p className="text-slate-300 mb-8 text-center max-w-xl">
        Describe your idea and generate a fully designed landing page instantly.
      </p>

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">

        <textarea
          placeholder="Example: Modern SaaS landing page for AI resume builder..."
          className="w-full h-32 p-4 rounded-xl bg-black/40 border border-white/20 outline-none"
          value={prompt}
          onChange={(e)=>setPrompt(e.target.value)}
        />

        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold"
        >
          {loading ? "Generating..." : "Generate Landing Page"}
        </button>

      </div>

      {showAuth && (
        <AuthModal onClose={()=>setShowAuth(false)} />
      )}

    </main>
  );
}