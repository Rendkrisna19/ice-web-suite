import { redirect } from "next/navigation";

export default function Home() {
  // Ini tugasnya melempar user dari "localhost:3000" -> "localhost:3000/login"
  redirect("/login");
}
