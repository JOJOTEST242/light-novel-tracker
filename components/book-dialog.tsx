"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book } from "@/lib/types"

interface BookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book?: Book | null
  onSave: (book: Book) => void
  yearGroups: string[]
}

const emptyBook: Book = {
  id: "",
  title: "",
  author: "",
  authorLink: "",
  twProgress: "",
  twDate: "",
  preOrderDate: "",
  jpProgress: "",
  jpDate: "",
  cnStatus: "",
  readProgress: "",
  yearGroup: "",
}

export function BookDialog({ open, onOpenChange, book, onSave, yearGroups }: BookDialogProps) {
  const [formData, setFormData] = useState<Book>(emptyBook)
  const [customYearGroup, setCustomYearGroup] = useState("")

  useEffect(() => {
    if (book) {
      setFormData(book)
    } else {
      setFormData({ ...emptyBook, yearGroup: yearGroups[0] || "" })
    }
    setCustomYearGroup("")
  }, [book, yearGroups, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalData = {
      ...formData,
      yearGroup: customYearGroup || formData.yearGroup,
    }
    onSave(finalData)
  }

  const updateField = (field: keyof Book, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{book ? "編輯書籍" : "新增書籍"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">書名 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="author">作者</Label>
                <Input id="author" value={formData.author} onChange={(e) => updateField("author", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="authorLink">作者連結</Label>
                <Input
                  id="authorLink"
                  type="url"
                  value={formData.authorLink}
                  onChange={(e) => updateField("authorLink", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="twProgress">台版進度</Label>
                <Input
                  id="twProgress"
                  value={formData.twProgress}
                  onChange={(e) => updateField("twProgress", e.target.value)}
                  placeholder="例：15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="twDate">台版日期</Label>
                <Input
                  id="twDate"
                  value={formData.twDate}
                  onChange={(e) => updateField("twDate", e.target.value)}
                  placeholder="例：2025-07-24"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preOrderDate">預購日期</Label>
              <Input
                id="preOrderDate"
                value={formData.preOrderDate}
                onChange={(e) => updateField("preOrderDate", e.target.value)}
                placeholder="例：2026-02-05"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jpProgress">日版進度</Label>
                <Input
                  id="jpProgress"
                  value={formData.jpProgress}
                  onChange={(e) => updateField("jpProgress", e.target.value)}
                  placeholder="例：16"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jpDate">日版日期</Label>
                <Input
                  id="jpDate"
                  value={formData.jpDate}
                  onChange={(e) => updateField("jpDate", e.target.value)}
                  placeholder="例：2025-07-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cnStatus">中翻狀態</Label>
                <Input
                  id="cnStatus"
                  value={formData.cnStatus}
                  onChange={(e) => updateField("cnStatus", e.target.value)}
                  placeholder="例：15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="readProgress">看書進度</Label>
                <Input
                  id="readProgress"
                  value={formData.readProgress}
                  onChange={(e) => updateField("readProgress", e.target.value)}
                  placeholder="例：15"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>年份分組</Label>
              {yearGroups.length > 0 ? (
                <Select
                  value={formData.yearGroup}
                  onValueChange={(value) => {
                    if (value === "__custom__") {
                      updateField("yearGroup", "")
                    } else {
                      updateField("yearGroup", value)
                      setCustomYearGroup("")
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇年份分組" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearGroups.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">自訂...</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              {(yearGroups.length === 0 || formData.yearGroup === "") && (
                <Input
                  value={customYearGroup || formData.yearGroup}
                  onChange={(e) => {
                    setCustomYearGroup(e.target.value)
                    updateField("yearGroup", "")
                  }}
                  placeholder="例：2024年~2025年"
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{book ? "儲存變更" : "新增書籍"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
