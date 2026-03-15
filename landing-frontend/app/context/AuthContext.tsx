"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthType = {
  logged: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: any) {

  const [logged,setLogged] = useState(false);

  useEffect(()=>{
    const token = localStorage.getItem("token");
    setLogged(!!token);
  },[]);

  function login(token:string){
    localStorage.setItem("token",token);
    setLogged(true);
  }

  function logout(){
    localStorage.removeItem("token");
    setLogged(false);
  }

  return (
    <AuthContext.Provider value={{logged,login,logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
  const ctx = useContext(AuthContext);
  if(!ctx) throw new Error("AuthContext missing");
  return ctx;
}