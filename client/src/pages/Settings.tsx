import { SiteHeader } from "@/components/site-header"
import ThemeModeToggle from "@/components/ThemeModeToggle"

export default function Settings() {
  return (
    <>
      <SiteHeader title="Settings" />

      <div className="p-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Тема приложения</h3>
            <p className="text-sm text-muted-foreground">
              Выберите светлую, тёмную или системную тему оформления.
            </p>
          </div>

          <ThemeModeToggle />
        </div>
      </div>
    </>
  )
}
