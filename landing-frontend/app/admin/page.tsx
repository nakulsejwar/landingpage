"use client";

import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {

  const [pages,setPages] = useState<any[]>([]);
  const router = useRouter();

  useEffect(()=>{

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}my-pages/`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res=>res.json())
    .then(data=>{
      
      console.log("API RESPONSE:",data);

      // ensure pages is always array
      if(Array.isArray(data)){
        setPages(data);
      }
      else if(Array.isArray(data.pages)){
        setPages(data.pages);
      }
      else{
        setPages([]);
      }

    });

  },[]);

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900 text-white">

      <Header/>

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-3xl font-bold mb-10">
          Your Landing Pages
        </h1>

        {pages.length === 0 && (
          <p className="text-slate-400">
            No pages generated yet.
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {pages.map((p:any)=>(
            <div
              key={p.id}
              className="bg-white/10 backdrop-blur border border-white/10 p-6 rounded-xl hover:border-purple-500 transition"
            >

              <h2 className="font-semibold text-lg mb-2">
                {p.title || "Untitled Page"}
              </h2>

              {p.created_at && (
                <p className="text-xs text-slate-400 mb-4">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              )}

              <button
                onClick={()=>router.push(`/edit/${p.id}`)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 mx-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={()=>router.push(`/site/${p.id}`)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 mx-1 rounded"
              >
                View Site
              </button>

            </div>
          ))}

        </div>

      </div>

    </main>

  );

}