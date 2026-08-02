import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";

export function AdminTopbar() {
  return <div className="admin-topbar"><div className="shell admin-topbar__inner"><Link className="admin-brand" href="/admin">Ottawa Burger <span>Spot</span> · Editor</Link><div style={{ display: "flex", gap: ".7rem", alignItems: "center" }}><Link className="text-link" href="/" target="_blank">View site ↗</Link><form action={logoutAction}><button className="button button--paper" style={{ minHeight: 40, padding: ".35rem .7rem" }}>Sign out</button></form></div></div></div>;
}
