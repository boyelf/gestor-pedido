"use client";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { LayoutGrid } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getImageUrlWithTimestamp } from "@/lib/utils";
import { ListaPedidos } from "./components/ListaPedidos";

export default function DashboardPage() {

const { user } = useAuth();


return (
    <div>
    <nav className="px-6 py-4 flex justify-between border-b">
        <div className="text-xl font-extrabold tracking-tight flex items-center gap-3" >
            <LayoutGrid size={32}/>
           Gestor Pedidos
        </div>
        {user && (
        
        <Link href="/profile" >
           <AvatarBadge name={user?.name || "Usuario"} avatar_url={getImageUrlWithTimestamp(user?.avatar_url) || undefined} />
        </Link>
        
        )}
        
    </nav>
    
    <ListaPedidos />
    </div>
)
}
