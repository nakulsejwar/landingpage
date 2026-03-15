"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";


export default function AuthModal({ onClose }: any) {

  const [mode,setMode] = useState<"login"|"register">("login");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [email,setEmail] = useState("");
  const { login } = useAuth();
  async function submit(){

    try{

      if(mode === "register"){

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}register/`,{
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({ username,email,password })
        })

      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}login/`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username,password })
      })

      const data = await res.json();

      login(data.access);

      onClose();

    }catch(err){
      alert("Login failed")
    }

  }

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">

      <div className="bg-white text-black p-6 rounded-xl w-[380px] space-y-4 shadow-xl">

        <div className="flex justify-between items-center">

          <h2 className="text-xl font-bold">
            {mode === "login" ? "Login" : "Create Account"}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        {mode==="register" && (
          <input
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
        )}

        <input
          placeholder="Username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={submit}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          {mode==="login" ? "Login" : "Register"}
        </button>

        <button
          onClick={()=>setMode(mode==="login"?"register":"login")}
          className="text-sm text-gray-500"
        >
          {mode==="login"
            ? "Create an account"
            : "Already have an account"}
        </button>

      </div>

    </div>
  )
}