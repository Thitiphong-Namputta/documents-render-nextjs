"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileTextIcon, FilesIcon, HomeIcon, ScrollTextIcon, ChevronRightIcon } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navItems = [
  {
    title: "หน้าแรก",
    href: "/",
    icon: HomeIcon,
    items: [],
  },
  {
    title: "รายการ PDF",
    href: "/pdfs",
    icon: FilesIcon,
    items: [],
  },
  {
    title: "ฟอร์มเอกสาร",
    href: "/forms",
    icon: FileTextIcon,
    items: [
      { title: "หนังสือมอบอำนาจ", href: "/forms/power-of-attorney", icon: ScrollTextIcon },
      { title: "ใบแจ้งหนี้", href: "/forms/invoice", icon: FileTextIcon },
    ],
  },
]

export function AppSidebarNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const isGroupActive = item.items.some((sub) => pathname === sub.href) || pathname === item.href

        if (item.items.length === 0) {
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        return (
          <Collapsible key={item.href} asChild defaultOpen={isGroupActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive}>
                  <item.icon />
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((sub) => (
                    <SidebarMenuSubItem key={sub.href}>
                      <SidebarMenuSubButton asChild isActive={pathname === sub.href}>
                        <Link href={sub.href}>
                          <sub.icon />
                          <span>{sub.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </SidebarMenu>
  )
}