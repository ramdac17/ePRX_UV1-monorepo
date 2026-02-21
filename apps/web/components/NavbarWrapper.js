"use client";
import { useState } from "react";
import Navbar from "./Navbar";
import NavbarDrawer from "./NavbarDrawer";
import { useAuth } from "@/context/AuthContext";
export default function NavbarWrapper() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { logout } = useAuth();
    return (<>
      <NavbarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onLogout={logout}/>
      <Navbar onMenuClick={() => setIsDrawerOpen(true)}/>
    </>);
}
