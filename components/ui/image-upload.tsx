import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true)
      const file = e.target.files?.[0]
      
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      onChange(data.url)
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden">
        <Image
          src={value || "/placeholder.svg"}
          alt="Upload preview"
          className="object-cover"
          fill
        />
      </div>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || isLoading}
          className="relative"
        >
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin absolute" />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={disabled || isLoading}
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <span className={isLoading ? "invisible" : ""}>
            {value ? "Change Image" : "Upload Image"}
          </span>
        </Button>
        {value && (
          <Button
            type="button"
            variant="destructive"
            onClick={onRemove}
            disabled={disabled || isLoading}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
} 