'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkillType } from '@/types';
import { mockSkills, mockUnits } from '@/lib/mockData';

export default function AdminContentPage() {
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('listening');

  const skillInfo = mockSkills.find((s) => s.id === selectedSkill) || mockSkills[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-brand-blue">
              ← Admin Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-bold text-brand-blue">Khung học liệu</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Quản Trị Khung Học Liệu Hệ Thống</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cấu trúc phân cấp Course → Unit → Lesson phân bổ theo các thang bậc CEFR (A1 - C2).
          </p>
        </div>

        <Link href="/student/learn">
          <Button variant="outline" size="sm">
            Xem dưới góc nhìn Học sinh ↗
          </Button>
        </Link>
      </div>

      {/* Skill Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {mockSkills.map((sk) => (
          <button
            key={sk.id}
            onClick={() => setSelectedSkill(sk.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedSkill === sk.id
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {sk.name}
          </button>
        ))}
      </div>

      {/* Skill Overview Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-brand-dark">{skillInfo.name} Curriculum</h2>
              <Badge variant="info">CEFR A1 — C1</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">{skillInfo.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase font-bold">Tổng bài học</div>
              <div className="text-xl font-extrabold text-brand-blue">{mockUnits.length * 4} Lessons</div>
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {mockUnits.map((unit) => (
            <div
              key={unit.id}
              className="p-4 border border-gray-200 rounded-2xl bg-white hover:border-brand-blue/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue font-extrabold text-xs flex items-center justify-center">
                    U{unit.order}
                  </span>
                  <h3 className="font-bold text-base text-brand-dark">{unit.title}</h3>
                  <Badge variant="neutral">{unit.level}</Badge>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {unit.lessons.length} bài học • Socratic AI Tutor: Bật
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3">{unit.description}</p>

              {/* Lesson Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                {unit.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-2.5 rounded-xl bg-gray-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-800">{lesson.title}</span>
                      <div className="text-gray-400 mt-0.5">
                        {lesson.estimatedMinutes} phút • {lesson.questionCount} câu hỏi tương tác
                      </div>
                    </div>
                    <Badge variant={lesson.status === 'completed' ? 'success' : 'neutral'}>
                      {lesson.status === 'completed' ? 'Đã duyệt' : 'Hoạt động'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
