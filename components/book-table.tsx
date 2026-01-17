"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, MoreHorizontal, Plus, Trash2, Calendar } from "lucide-react"
import type { Publisher } from "@/lib/types"

interface BookTableProps {
  publisher: Publisher
  publisherIndex: number
  onEditBook: (bookIndex: number) => void
  onDeleteBook: (bookIndex: number) => void
  onAddBook: () => void
  onDeletePublisher: () => void
  onAddYearGroup: (yearGroup: string) => void
  onEditYearGroup: (oldYear: string, newYear: string) => void
  onDeleteYearGroup: (yearGroup: string) => void
}

export function BookTable({
  publisher,
  publisherIndex,
  onEditBook,
  onDeleteBook,
  onAddBook,
  onDeletePublisher,
  onAddYearGroup,
  onEditYearGroup,
  onDeleteYearGroup,
}: BookTableProps) {
  const [editingYear, setEditingYear] = useState<string | null>(null)
  const [yearInput, setYearInput] = useState("")
  const [isAddingYear, setIsAddingYear] = useState(false)
  const [newYearInput, setNewYearInput] = useState("")

  // Group books by yearGroup
  const booksByYear = new Map<string, { book: (typeof publisher.books)[0]; originalIndex: number }[]>()

  // 先初始化所有年份分組（包含空的）
  publisher.yearGroups.forEach((year) => {
    if (!booksByYear.has(year)) booksByYear.set(year, [])
  })

  publisher.books.forEach((book, index) => {
    const year = book.yearGroup || "其他"
    if (!booksByYear.has(year)) booksByYear.set(year, [])
    booksByYear.get(year)!.push({ book, originalIndex: index })
  })

  const handleEditYear = (oldYear: string) => {
    setEditingYear(oldYear)
    setYearInput(oldYear)
  }

  const handleSaveYear = () => {
    if (editingYear && yearInput.trim()) {
      onEditYearGroup(editingYear, yearInput.trim())
      setEditingYear(null)
      setYearInput("")
    }
  }

  const handleAddYear = () => {
    if (newYearInput.trim()) {
      onAddYearGroup(newYearInput.trim())
      setIsAddingYear(false)
      setNewYearInput("")
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Publisher Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ backgroundColor: publisher.color }}
      >
        <span className="font-bold text-slate-700">🏢 {publisher.name}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/60 px-3 py-0.5 text-xs font-bold text-slate-600">
            {publisher.books.length} BOOKS
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddBook}>
                <Plus className="mr-2 h-4 w-4" />
                新增書籍
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddingYear(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                新增年份分組
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeletePublisher} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                刪除出版社
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Book Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-bold">書籍資訊</TableHead>
              <TableHead className="text-center font-bold">台版進度</TableHead>
              <TableHead className="text-center font-bold">日版進度</TableHead>
              <TableHead className="text-center font-bold">中翻狀態</TableHead>
              <TableHead className="font-bold">看書進度</TableHead>
              <TableHead className="w-16 font-bold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(booksByYear.entries()).map(([year, books]) => (
              <>
                <TableRow key={`year-${year}`} className="bg-slate-100/50 group">
                  <TableCell
                    colSpan={5}
                    className="py-2 text-center text-sm font-extrabold uppercase tracking-widest text-slate-500"
                  >
                    {year}
                  </TableCell>
                  <TableCell className="py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditYear(year)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編輯年份
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm(`確定要刪除「${year}」分組嗎？該分組下的書籍將移至「其他」分組。`)) {
                              onDeleteYearGroup(year)
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除分組
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {books.map(({ book, originalIndex }) => (
                  <TableRow key={book.id} className="transition-colors hover:bg-slate-50/80">
                    <TableCell>
                      <div className="text-sm font-bold text-slate-700">{book.title}</div>
                      <div className="mt-0.5 text-xs">
                        {book.authorLink ? (
                          <a
                            href={book.authorLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-red-600 underline hover:text-red-700"
                          >
                            {book.author}
                          </a>
                        ) : (
                          <span className="font-bold text-red-600">{book.author}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-bold text-slate-600">{book.twProgress}</div>
                      {book.twDate && (
                        <div className="mt-1 inline-block rounded bg-slate-500 px-1.5 py-0.5 text-[10px] text-white">
                          {book.twDate}
                        </div>
                      )}
                      {book.preOrderDate && (
                        <div className="mx-auto mt-1.5 w-fit rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                          📅 {book.preOrderDate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-bold text-blue-600">{book.jpProgress}</div>
                      {book.jpDate && (
                        <div className="mt-1 inline-block rounded bg-blue-500/80 px-1.5 py-0.5 text-[10px] text-white">
                          {book.jpDate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                        {book.cnStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-blue-600">{book.readProgress}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditBook(originalIndex)}>
                            <Edit className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm(`確定要刪除「${book.title}」嗎？`)) {
                                onDeleteBook(originalIndex)
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            {publisher.books.length === 0 && booksByYear.size === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  尚無書籍，點擊右上角選單新增
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editingYear !== null} onOpenChange={(open) => !open && setEditingYear(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯年份分組</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="yearGroup">年份分組名稱</Label>
              <Input
                id="yearGroup"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="例如：2024年~2025年"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingYear(null)}>
              取消
            </Button>
            <Button onClick={handleSaveYear}>儲存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingYear} onOpenChange={setIsAddingYear}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增年份分組</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newYearGroup">年份分組名稱</Label>
              <Input
                id="newYearGroup"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder="例如：2024年~2025年"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingYear(false)}>
              取消
            </Button>
            <Button onClick={handleAddYear}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
