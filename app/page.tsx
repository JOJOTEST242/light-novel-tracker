import { Suspense } from "react"
import { LightNovelManager } from "@/components/light-novel-manager"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <LightNovelManager />
    </Suspense>
  )
}
