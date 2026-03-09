import React from "react";
import UserProfile from "./components/UserProfile";
import TarjetaPedido from "@/components/TarjetaPedido";

export default function ProfilePage() {

return (
    <div className="flex items-center justify-center h-screen p-4">
      <UserProfile />
      {/* <TarjetaPedido />
      <TarjetaPedido />
      <TarjetaPedido /> */}
     </div>
)
}