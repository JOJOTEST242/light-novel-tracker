"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookTable } from "@/components/book-table"
import { BookDialog } from "@/components/book-dialog"
import { ImportExportButtons } from "@/components/import-export-buttons"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Plus, Search, BookPlus } from "lucide-react"
import type { Book, Publisher } from "@/lib/types"

export function LightNovelManager() {
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingBook, setEditingBook] = useState<{ book: Book; publisherIndex: number; bookIndex: number } | null>(null)
  const [isAddingBook, setIsAddingBook] = useState(false)
  const [selectedPublisher, setSelectedPublisher] = useState<number | null>(null)
  const [activePublisherFilter, setActivePublisherFilter] = useState<string>("all")
  const [isSelectingPublisher, setIsSelectingPublisher] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportHTML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const html = event.target?.result as string
      const parsed = parseHTMLToData(html)
      setPublishers(parsed)
    }
    reader.readAsText(file)
  }

  const parseHTMLToData = (html: string): Publisher[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const sections = doc.querySelectorAll(".publisher-section")
    const result: Publisher[] = []

    sections.forEach((section) => {
      const headerEl = section.querySelector(".px-6.py-4")
      const nameMatch = headerEl?.textContent?.match(/🏢\s*(.+)/)
      const name = nameMatch ? nameMatch[1].trim() : "未知出版社"
      const bgColor = (headerEl as HTMLElement)?.style.backgroundColor || "#ffccff"

      const books: Book[] = []
      const yearGroups: string[] = []
      const rows = section.querySelectorAll("tr.book-row")

      // 先收集所有年份分組
      const separatorRows = section.querySelectorAll("tr.separator-row")
      separatorRows.forEach((sep) => {
        const yearText = sep.textContent?.trim() || ""
        if (yearText && !yearGroups.includes(yearText)) {
          yearGroups.push(yearText)
        }
      })

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td")
        if (cells.length < 5) return

        const titleEl = cells[0].querySelector(".font-bold")
        const authorEl = cells[0].querySelector("a")
        const twProgressEl = cells[1].querySelector(".font-mono")
        const twDateEl = cells[1].querySelector(".date-tag")
        const preOrderEl = cells[1].querySelector(".pre-tag")
        const jpProgressEl = cells[2].querySelector(".font-mono")
        const jpDateEl = cells[2].querySelector(".date-tag")
        const cnStatusEl = cells[3].querySelector(".read-badge")
        const readProgressEl = cells[4].querySelector(".text-sm")

        books.push({
          id: crypto.randomUUID(),
          title: titleEl?.textContent?.trim() || "",
          author: authorEl?.textContent?.trim() || "",
          authorLink: authorEl?.getAttribute("href") || "",
          twProgress: twProgressEl?.textContent?.trim() || "",
          twDate: twDateEl?.textContent?.trim() || "",
          preOrderDate: preOrderEl?.textContent?.replace("📅", "").trim() || "",
          jpProgress: jpProgressEl?.textContent?.trim() || "",
          jpDate: jpDateEl?.textContent?.trim() || "",
          cnStatus: cnStatusEl?.textContent?.trim() || "",
          readProgress: readProgressEl?.textContent?.trim() || "",
          yearGroup: "",
        })
      })

      // 解析年份分組並分配給書籍
      separatorRows.forEach((sep) => {
        const yearText = sep.textContent?.trim() || ""
        const nextRows = []
        let sibling = sep.nextElementSibling
        while (sibling && !sibling.classList.contains("separator-row")) {
          if (sibling.classList.contains("book-row")) {
            nextRows.push(sibling)
          }
          sibling = sibling.nextElementSibling
        }
        nextRows.forEach((row) => {
          const bookIdx = Array.from(section.querySelectorAll("tr.book-row")).indexOf(row)
          if (books[bookIdx]) {
            books[bookIdx].yearGroup = yearText
          }
        })
      })

      result.push({ name, color: bgColor, books, yearGroups })
    })

    return result
  }

  const exportToHTML = () => {
    const html = generateHTML(publishers)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "My_Light_Novel_List.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateHTML = (data: Publisher[]): string => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, "0")}月${String(today.getDate()).padStart(2, "0")}日`

    let booksHtml = ""
    data.forEach((publisher) => {
      const yearGroups = new Map<string, Book[]>()

      // 先初始化所有年份分組
      publisher.yearGroups.forEach((year) => {
        if (!yearGroups.has(year)) yearGroups.set(year, [])
      })

      publisher.books.forEach((book) => {
        const group = book.yearGroup || "其他"
        if (!yearGroups.has(group)) yearGroups.set(group, [])
        yearGroups.get(group)!.push(book)
      })

      let tableRows = ""
      yearGroups.forEach((books, year) => {
        tableRows += `
                        <tr class="separator-row">
                            <td colspan="5" class="px-6 py-3 text-sm bg-slate-100/50 uppercase">${year}</td>
                        </tr>
                `
        books.forEach((book) => {
          const preOrderHtml = book.preOrderDate
            ? `<div class="pre-tag bg-amber-500">📅 ${book.preOrderDate}</div>`
            : ""

          tableRows += `
                        <tr class="book-row hover:bg-slate-50/80" data-search="${book.title} ${book.author} ${book.twProgress} ${book.readProgress}">
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-700 text-sm">${book.title}</div>
                                <div class="text-xs text-slate-400 mt-0.5"><a href="${book.authorLink}" target="_blank" class="hover:text-blue-500 underline">${book.author}</a></div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="font-mono text-sm font-bold text-slate-600">${book.twProgress}</div>
                                <div class="date-tag tracking-tighter" title="最後發售日期">${book.twDate}</div>
                                ${preOrderHtml}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="font-mono text-sm font-bold text-blue-600">${book.jpProgress}</div>
                                <div class="date-tag tracking-tighter bg-blue-500/80" title="最後發售日期">${book.jpDate}</div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="read-badge badge-none">${book.cnStatus}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm text-blue-600 font-medium">${book.readProgress}</span>
                            </td>
                        </tr>
                `
        })
      })

      booksHtml += `
        <div class="mb-10 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden publisher-section">
            <div class="px-6 py-4 flex justify-between items-center border-b border-slate-50" style="background-color: ${publisher.color};">
                <span class="font-bold text-slate-700">🏢 ${publisher.name}</span>
                <span class="bg-white/60 text-slate-600 px-3 py-0.5 rounded-full text-xs font-bold">${publisher.books.length} BOOKS</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-4">書籍資訊</th>
                            <th class="px-6 py-4 text-center">台版進度</th>
                            <th class="px-6 py-4 text-center">日版進度</th>
                            <th class="px-6 py-4 text-center">中翻狀態</th>
                            <th class="px-6 py-4">看書進度</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
      `
    })

    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>輕小說進度追蹤</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #f8fafc; font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif; }
        .date-tag { font-size: 0.7rem; background: #64748b; color: white; padding: 1px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
        .pre-tag { font-size: 0.72rem; color: white; padding: 3px 8px; border-radius: 6px; font-weight: 600; display: block; margin: 6px auto 0; max-width: fit-content; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .read-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; font-weight: bold; display: inline-block; }
        .badge-done { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-none { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
        .book-row { transition: background 0.2s; }
        .separator-row { background-color: #f1f5f9; font-weight: 800; color: #475569; text-align: center; letter-spacing: 0.2em; }
        .new-badge { background: #ef4444; color: white; font-size: 0.65rem; padding: 1px 4px; border-radius: 3px; margin-left: 5px; vertical-align: middle; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">📚 輕小說進度表</h1>
                <p class="text-slate-400 text-sm mt-1">最後更新：${dateStr}</p>
            </div>
            <div class="mt-4 md:mt-0 w-full md:w-96">
                <input type="text" id="searchInput" placeholder="搜尋書名、作者或進度..." 
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all" onkeyup="filterBooks()">
            </div>
        </div>
    
        ${booksHtml}
    </div>

    <script>
        function filterBooks() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            document.querySelectorAll('.book-row').forEach(row => {
                const text = row.getAttribute('data-search').toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        }
    </script>
</body>
</html>`
  }

  const handleDeleteBook = (publisherIndex: number, bookIndex: number) => {
    setPublishers((prev) => {
      const updated = [...prev]
      updated[publisherIndex].books.splice(bookIndex, 1)
      return updated
    })
  }

  const handleSaveBook = (book: Book) => {
    if (editingBook) {
      setPublishers((prev) => {
        const updated = [...prev]
        updated[editingBook.publisherIndex].books[editingBook.bookIndex] = book
        return updated
      })
      setEditingBook(null)
    } else if (isAddingBook && selectedPublisher !== null) {
      setPublishers((prev) => {
        const updated = [...prev]
        updated[selectedPublisher].books.push({ ...book, id: crypto.randomUUID() })
        return updated
      })
      setIsAddingBook(false)
      setSelectedPublisher(null)
    }
  }

  const handleAddPublisher = () => {
    const name = prompt("請輸入出版社名稱：")
    if (name) {
      setPublishers((prev) => [...prev, { name, color: "#e0e7ff", books: [], yearGroups: [] }])
    }
  }

  const handleDeletePublisher = (index: number) => {
    if (confirm(`確定要刪除「${publishers[index].name}」及其所有書籍嗎？`)) {
      setPublishers((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleAddYearGroup = (publisherIndex: number, yearGroup: string) => {
    setPublishers((prev) => {
      const updated = [...prev]
      if (!updated[publisherIndex].yearGroups.includes(yearGroup)) {
        updated[publisherIndex].yearGroups.push(yearGroup)
      }
      return updated
    })
  }

  const handleEditYearGroup = (publisherIndex: number, oldYear: string, newYear: string) => {
    setPublishers((prev) => {
      const updated = [...prev]
      // 更新年份分組列表
      const yearIdx = updated[publisherIndex].yearGroups.indexOf(oldYear)
      if (yearIdx !== -1) {
        updated[publisherIndex].yearGroups[yearIdx] = newYear
      }
      // 更新書籍的年份分組
      updated[publisherIndex].books = updated[publisherIndex].books.map((book) =>
        book.yearGroup === oldYear ? { ...book, yearGroup: newYear } : book,
      )
      return updated
    })
  }

  const handleDeleteYearGroup = (publisherIndex: number, yearGroup: string) => {
    setPublishers((prev) => {
      const updated = [...prev]
      // 從年份分組列表移除
      updated[publisherIndex].yearGroups = updated[publisherIndex].yearGroups.filter((y) => y !== yearGroup)
      // 將該分組的書籍移至「其他」
      updated[publisherIndex].books = updated[publisherIndex].books.map((book) =>
        book.yearGroup === yearGroup ? { ...book, yearGroup: "其他" } : book,
      )
      return updated
    })
  }

  const filteredPublishers = publishers
    .filter((publisher) => activePublisherFilter === "all" || publisher.name === activePublisherFilter)
    .map((publisher) => ({
      ...publisher,
      books: publisher.books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))

  const publisherNames = publishers.map((p) => p.name)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">📚 輕小說進度管理工具</h1>
            <p className="mt-1 text-sm text-slate-400">支援編輯、刪除、匯入與匯出 HTML</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="搜尋書名或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:w-64"
              />
            </div>
            {publishers.length > 0 && (
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsSelectingPublisher(true)}
              >
                <BookPlus className="mr-2 h-4 w-4" />
                新增書籍
              </Button>
            )}
            <ImportExportButtons
              onImport={() => fileInputRef.current?.click()}
              onExport={exportToHTML}
              hasData={publishers.length > 0}
            />
            <input ref={fileInputRef} type="file" accept=".html" className="hidden" onChange={handleImportHTML} />
          </div>
        </div>

        {publishers.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Button
              variant={activePublisherFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePublisherFilter("all")}
              className={activePublisherFilter === "all" ? "bg-slate-800 hover:bg-slate-700" : ""}
            >
              所有
            </Button>
            {publisherNames.map((name) => (
              <Button
                key={name}
                variant={activePublisherFilter === name ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePublisherFilter(name)}
                className={activePublisherFilter === name ? "bg-slate-800 hover:bg-slate-700" : ""}
              >
                {name}
              </Button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {publishers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mb-4 text-6xl">📖</div>
            <h2 className="mb-2 text-xl font-bold text-slate-700">尚無資料</h2>
            <p className="mb-6 text-slate-500">請匯入現有的 HTML 檔案，或新增出版社開始管理您的輕小說清單</p>
            <div className="flex gap-3">
              <Button onClick={() => fileInputRef.current?.click()}>匯入 HTML</Button>
              <Button variant="outline" onClick={handleAddPublisher}>
                <Plus className="mr-2 h-4 w-4" />
                新增出版社
              </Button>
            </div>
          </div>
        )}

        {/* Publishers */}
        {filteredPublishers.map((publisher) => {
          const publisherIndex = publishers.findIndex((p) => p.name === publisher.name)
          return (
            <BookTable
              key={publisher.name}
              publisher={publisher}
              publisherIndex={publisherIndex}
              onEditBook={(bookIndex) =>
                setEditingBook({
                  book: publishers[publisherIndex].books[bookIndex],
                  publisherIndex,
                  bookIndex,
                })
              }
              onDeleteBook={(bookIndex) => handleDeleteBook(publisherIndex, bookIndex)}
              onAddBook={() => {
                setSelectedPublisher(publisherIndex)
                setIsAddingBook(true)
              }}
              onDeletePublisher={() => handleDeletePublisher(publisherIndex)}
              onAddYearGroup={(yearGroup) => handleAddYearGroup(publisherIndex, yearGroup)}
              onEditYearGroup={(oldYear, newYear) => handleEditYearGroup(publisherIndex, oldYear, newYear)}
              onDeleteYearGroup={(yearGroup) => handleDeleteYearGroup(publisherIndex, yearGroup)}
            />
          )
        })}

        {publishers.length > 0 && (
          <Button variant="outline" className="mt-4 w-full bg-transparent" onClick={handleAddPublisher}>
            <Plus className="mr-2 h-4 w-4" />
            新增出版社
          </Button>
        )}

        {isSelectingPublisher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-bold text-slate-800">選擇出版社</h2>
              <p className="mb-4 text-sm text-slate-500">請選擇要新增書籍的出版社</p>
              <div className="grid gap-2">
                {publishers.map((publisher, index) => (
                  <Button
                    key={publisher.name}
                    variant="outline"
                    className="justify-start bg-transparent"
                    style={{ borderLeftColor: publisher.color, borderLeftWidth: 4 }}
                    onClick={() => {
                      setSelectedPublisher(index)
                      setIsAddingBook(true)
                      setIsSelectingPublisher(false)
                    }}
                  >
                    🏢 {publisher.name}
                    <span className="ml-auto text-xs text-slate-400">{publisher.books.length} 本</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setIsSelectingPublisher(false)}>
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Add Dialog */}
        <BookDialog
          open={editingBook !== null || isAddingBook}
          onOpenChange={(open) => {
            if (!open) {
              setEditingBook(null)
              setIsAddingBook(false)
              setSelectedPublisher(null)
            }
          }}
          book={editingBook?.book}
          onSave={handleSaveBook}
          yearGroups={
            selectedPublisher !== null
              ? publishers[selectedPublisher]?.yearGroups || []
              : editingBook
                ? publishers[editingBook.publisherIndex]?.yearGroups || []
                : []
          }
        />
      </div>

      <ScrollToTop />
    </div>
  )
}
