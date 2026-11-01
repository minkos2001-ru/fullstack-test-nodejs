import { Sun, Moon, Monitor } from "lucide-react"

import { useTheme } from "./theme-provider"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = {
    light: { label: "Light", icon: Sun },
    dark: { label: "Dark", icon: Moon },
    system: { label: "System", icon: Monitor },
  }

  const CurrentIcon = themes[theme as keyof typeof themes]?.icon ?? Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label="Change theme"
        className={buttonVariants({ variant: "outline", size: "icon" })}
      >
        <CurrentIcon className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
