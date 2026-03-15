"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import AuthModal from "../../components/AuthModal";
import { isLoggedIn } from "../../utils/auth";

const DynamicSectionEditor = dynamic(
  () => import("./DynamicSectionEditor"),
  { ssr: false }
);

export default function EditPage() {

  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const [sections,setSections] = useState<any>({});
  const [order,setOrder] = useState<string[]>([]);
  const [active,setActive] = useState("");

  const [saving,setSaving] = useState(false);
  const [isReady,setIsReady] = useState(false);

  const [showAuth,setShowAuth] = useState(false);

  const [aiPrompt,setAiPrompt] = useState("");

  useEffect(()=>{

    if(!isLoggedIn()){
      setShowAuth(true);
      return;
    }

    if(!pageId) return;

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/edit/`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res=>res.json())
    .then(data=>{

      setSections(data.sections || {});
      setOrder(data.section_order || []);

      if(data.section_order?.length){
        setActive(data.section_order[0]);
      }

    });

    // load tailwind
    if(!document.getElementById("tailwind-cdn")){

      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";

      script.onload = ()=>setIsReady(true);

      document.head.appendChild(script);

    }else{
      setIsReady(true);
    }

  },[pageId]);

  if(!isReady) return null;

  function updateCode(section:string,newCode:string){

    setSections((prev:any)=>({
      ...prev,
      [section]:{
        ...prev[section],
        code:newCode
      }
    }));

  }

  async function saveAll(){

    if(saving) return;

    try{

      setSaving(true);

      const token = localStorage.getItem("token");

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/update/`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
          },
          body:JSON.stringify({
            sections,
            section_order:order
          })
        }
      );

      alert("Saved");

    }catch(err){

      console.error(err);
      alert("Save failed");

    }finally{
      setSaving(false);
    }

  }

  async function regenerate(section:string){

    if(!aiPrompt){
      alert("Enter AI instructions");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/section/${section}/regenerate/`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          prompt: aiPrompt
        })
      }
    );

    const data = await res.json();

    if(data?.code){
      updateCode(section,data.code);
      setAiPrompt("");
    }

  }

  async function deleteSection(section:string){

    if(!confirm(`Delete ${section}?`)) return;

    const token = localStorage.getItem("token");

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/section/delete/`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          sections:[section]
        })
      }
    );

    const newSections = {...sections};
    delete newSections[section];

    setSections(newSections);
    setOrder(order.filter(s=>s!==section));

  }

  async function deletePage(){

    if(!confirm("Delete this page?")) return;

    const token = localStorage.getItem("token");

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/delete/`,
      {
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    router.push("/admin");

  }

  return (

    <div className="bg-white text-black">

      <Header/>

      <div className="flex h-[calc(100vh-70px)]">

        {/* Sidebar */}

        <div className="w-80 border-r border-black/60 p-4 space-y-4 ">

          <h2 className="text-lg font-semibold">
            Sections
          </h2>

          {order.map((s:string)=>(
            <button
              key={s}
              onClick={()=>setActive(s)}
              className={`block w-full text-left p-2 rounded
              ${active===s
                ? "bg-purple-600"
                : "hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}

          {/* AI Prompt */}

          <div className="space-y-2 pt-4">

            <textarea
              placeholder={`Improve ${active} section...`}
              value={aiPrompt}
              onChange={(e)=>setAiPrompt(e.target.value)}
              className="w-full h-24 p-2 text-black rounded"
            />

            <button
              onClick={()=>regenerate(active)}
              className="w-full bg-yellow-500 py-2 rounded"
            >
              Regenerate Section
            </button>

            <button
              onClick={()=>deleteSection(active)}
              className="w-full bg-red-500 py-2 rounded"
            >
              Delete Section
            </button>

          </div>

          {/* Page actions */}

          <div className="pt-4 space-y-2">

            <button
              onClick={saveAll}
              disabled={saving}
              className="w-full bg-purple-600 py-2 rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={deletePage}
              className="w-full bg-red-700 py-2 rounded"
            >
              Delete Page
            </button>

          </div>

        </div>

        {/* Editor */}

        <div className="flex-1 overflow-auto bg-black/20">

          {order.map((s:string)=>{

            const sec = sections[s];

            if(!sec?.code) return null;

            return(

              <DynamicSectionEditor
                key={s}
                sectionName={s}
                code={sec.code}
                editable={s===active}
                onCodeChange={(c)=>updateCode(s,c)}
              />

            )

          })}

        </div>

      </div>

      {showAuth && (
        <AuthModal onClose={()=>setShowAuth(false)} />
      )}

    </div>

  );

}