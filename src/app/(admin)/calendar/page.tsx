"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";

interface Todo {
  _id: string;
  date: string;
  text: string;
  completed: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTodo, setNewTodo] = useState("");

  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const formatKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const selectedKey = formatKey(selectedDate);

  const selectedTodos = todos.filter((t) => t.date === selectedKey);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const res = await api.post("/todos", {
        text: newTodo.trim(),
        date: selectedKey,
        completed: false,
      });
      setTodos((prev) => [res.data, ...prev]);
      setNewTodo("");
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToToggle = todos.find((t) => t._id === id);
    if (!todoToToggle) return;
    
    // Optimistic update
    setTodos(todos.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t)));
    
    try {
      await api.patch(`/todos/${id}`, {
        completed: !todoToToggle.completed,
      });
    } catch (err) {
      console.error("Failed to toggle todo:", err);
      // Revert on error
      setTodos(todos.map((t) => (t._id === id ? { ...t, completed: todoToToggle.completed } : t)));
    }
  };

  const deleteTodo = async (id: string) => {
    const prevTodos = [...todos];
    // Optimistic update
    setTodos(todos.filter((t) => t._id !== id));
    
    try {
      await api.delete(`/todos/${id}`);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      // Revert on error
      setTodos(prevTodos);
    }
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const dayKey = formatKey(date);
      const dayTodos = todos.filter((t) => t.date === dayKey);

      cells.push(
        <div
          key={i}
          onClick={() => setSelectedDate(date)}
          className={`h-24 cursor-pointer overflow-hidden rounded-lg border p-2 transition-colors ${
            isSelected
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
              : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                isToday ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {i}
            </span>
            {dayTodos.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                {dayTodos.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayTodos.slice(0, 2).map((t) => (
              <div
                key={t._id}
                className={`truncate text-xs ${t.completed ? "line-through text-gray-400" : "text-gray-600 dark:text-gray-400"}`}
              >
                • {t.text}
              </div>
            ))}
            {dayTodos.length > 2 && <div className="text-[10px] text-gray-400">+{dayTodos.length - 2} more</div>}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Calendar & To-Do</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your schedule and daily tasks.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold uppercase text-gray-500">
                  {d}
                </div>
              ))}
              {renderCells()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              To-Do for {selectedDate.toDateString()}
            </h3>

            <form onSubmit={addTodo} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Add new task..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {selectedTodos.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No tasks for this day.</p>
              ) : (
                selectedTodos.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTodo(t._id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span
                        className={`truncate text-sm ${
                          t.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {t.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTodo(t._id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
